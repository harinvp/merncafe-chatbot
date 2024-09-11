const express = require("express");
const connectDB = require("./db/connection");
const ordersRoutes = require("./routes/orders");
const productRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const { OpenAI } = require("openai");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("./passport");
require("dotenv").config();
const axios = require('axios');
const MongoClient = require('mongodb').MongoClient;

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDB();

//Environment variables.
const {
  SESSION_SECRET,
  CONN_STRING,
  OPENAI_API_KEY,
  MONGO_URL,
  DB_NAME,
  COL_NAME_PRODUCTS,
  COL_NAME_INTENT,
  PORT,
  OPENAI_EMBEDDING_MODEL,
  OPENAI_EMBEDDING_URL,
  OPENAI_CHAT_COMPLETION_MODEL,
  VECTOR_SEARCH_PRODUCT_INDEX_NAME,
  VECTOR_SEARCH_INTENT_INDEX_NAME,
  VECTOR_SCORE
} = process.env;

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: CONN_STRING }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/users", usersRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/products", productRoutes);

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Handles incoming user chat messages and generates an AI response based on intent detection
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  console.log(`Received user message: ${userMessage}`);

  const username = req.session.username;
  console.log(`Username from session: ${username}`);

  const embedding = await getEmbedding(userMessage);
  const intent = await findIntent(embedding, userMessage);
  console.log(`Detected intent: ${intent}`);

  try {
    let response;

    switch (intent) {
      case 'product':
        const embedding = await getEmbedding(userMessage);
        response = await findDocuments(embedding, userMessage);
        break;
      case 'suggest':
        response = recommendations();
        break;
      case 'order':
        const orders = await searchOrdersBasedOnQuery(username, userMessage);
        console.log(`Orders found: ${JSON.stringify(orders)}`);
        response = await generateAIResponse(userMessage, orders);
        break;
      default:
        response = await generateAIResponse(userMessage);
        break;
    }

    res.json({ response });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error processing the request.');
  }
});

let conversationContext = {
  product: {},
  chat: [],
  otherProducts: []
};

// Sends the user query to OpenAI API to generate text embeddings
const getEmbedding = async (query) => {
  let response = await axios.post(OPENAI_EMBEDDING_URL, {
    input: query,
    model: "text-embedding-ada-002"
  }, {
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 200) {
    return response.data.data[0].embedding;
  } else {
    throw new Error(`Failed to get embedding. Status code: ${response.status}`);
  }
};

// Searches MongoDB using vector search to find the closest intent based on the query embedding
const findIntent = async (embedding, userMessage) => {
  const url = MONGO_URL;
  const client = new MongoClient(url);

  conversationContext.chat.push({ role: "user", content: userMessage });
  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COL_NAME_INTENT);
    const documents = await collection.aggregate([
      {
        "$vectorSearch": {
          "queryVector": embedding,
          "path": "phrase_embedding",
          "numCandidates": 50,
          "limit": 1,
          "index": VECTOR_SEARCH_INTENT_INDEX_NAME
        },
      },
      {
        "$project": {
          "intent": 1,
          "score": { "$meta": "vectorSearchScore" }
        }
      },
      {
        "$match": {
          "score": { "$gte": 0.9 }
        }
      }
    ]).toArray();

    if (documents.length > 0) {
      console.log(documents[0].intent);
      return documents[0].intent;
    } else {
      return 'casual';
    }
  } finally {
    await client.close();
  }
};

// Searches MongoDB for products based on query embeddings and returns the best match
const findDocuments = async (embedding, userMessage) => {
  const url = MONGO_URL;
  const client = new MongoClient(url);

  conversationContext.chat.push({ role: "user", content: userMessage });
  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COL_NAME_PRODUCTS);
    const documents = await collection.aggregate([
      {
        "$vectorSearch": {
          "queryVector": embedding,
          "path": "desc_embedding",
          "numCandidates": 100,
          "limit": 5,
          "index": VECTOR_SEARCH_PRODUCT_INDEX_NAME
        },
      },
      {
        "$project": {
          "desc_embedding": 1,
          "title": 1,
          "id": 1,
          "desc": 1,
          "score": { "$meta": "vectorSearchScore" }
        }
      },
      {
        "$match": {
          "score": { "$gte": 0.7 }
        }
      }
    ]).toArray();

    if (documents.length > 0) {
      const [firstDocument, ...restOfDocuments] = documents;   
      conversationContext.product = firstDocument;
      conversationContext.otherProducts = restOfDocuments.map(doc => ({
        id: doc.id,
        title: doc.title,
        desc: doc.desc
      }));

      const response = await generateAIEnhancedResponse(firstDocument, userMessage);
    
      conversationContext.chat.push({ role: "assistant", content: `${response}` });
      return {
        text: response,
        title: firstDocument.title,
        id: firstDocument.id,
        desc: firstDocument.desc
      };
    } else {
      return generateAIResponse(userMessage);
    }
  } finally {
    await client.close();
  }
};

// Fetches user-specific orders from MongoDB based on the username
const searchOrdersBasedOnQuery = async (username) => {
  const Order = require('./models/Order');

  try {
    const orders = await Order.find({ username: username }).exec();
    console.log(`Orders retrieved from database: ${JSON.stringify(orders)}`);
    return orders;
  } catch (error) {
    console.error('Error querying orders:', error);
    throw error;
  }
};

// Provides product recommendations from similar products stored in the conversation context
const recommendations = () => {
  let response = "We couldn't find any similar products at the moment. You might want to refine your search or try different keywords.";
  const otherProducts = conversationContext.otherProducts;
  const prodTitles = otherProducts.map(p => p.title).join(', ');
  if (otherProducts.length !== 0) {
    response = `Here are some products that might interest you: ${prodTitles}. Let me know if you need help with any of these or if there's something specific you're looking for!`
  }
  return {
    text: response
  };
};

//Enhance response
const generateAIEnhancedResponse = async (userMessage, product) => {
  let responseText = "Sorry, I couldn't process your request.";
  try {
    const messages = [
      {
        role: "system",
        content: `You are a helpful assistant for MilaJo online shop. Suggest this product and ask to click the link: ${product}.`,
      }
    ];


    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_COMPLETION_MODEL,
      messages: messages,
      max_tokens: 60 
    });

    responseText = completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    responseText = "Sorry, I couldn't process your request.";
  }
  return responseText;
};
// Generates a response using OpenAI's chat model based on the conversation context and user message
const generateAIResponse = async (userMessage) => {
  let responseText = "";
  try {
    const messages = [
      {
        role: "system",
        content: "You are a helpful assistant for MilaJo online shop. Use the context provided to answer questions about products and their availability. Always refer users to view specific items for the most accurate information and avoid suggesting external sources. If a user asks about specific details like sizes or availability, provide relevant information based on the context or suggest checking our shop for up-to-date details."
      },
      ...conversationContext.chat,
      { role: "user", content: userMessage }
    ];

    if (conversationContext.product) {
      messages.push({
        role: "system",
        content: `Product details: ${conversationContext.product.title} - ${conversationContext.product.desc}`
      });
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_COMPLETION_MODEL,
      messages: messages,
    });

    responseText = completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    responseText = "Sorry, I couldn't process your request.";
  }
  return {
    text: responseText
  };
};

app.use(express.static(path.join(__dirname, "..", "client", "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
});

const port = PORT || 8080;
app.listen(port, () =>
  console.log(`Server running on port ${port}`)
);
