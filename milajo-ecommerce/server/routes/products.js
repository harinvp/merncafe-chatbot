const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Middleware to protect routes with Passport authentication
const authenticate = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  next(); // Proceed if authenticated
};

// Add a new product
router.post("/add", (req, res) => {
  Product.create(req.body)
    .then((product) => res.json({ msg: "Product added successfully", product }))
    .catch((err) => res.status(400).json({ error: `Unable to add this product: ${err}` }));
});

// Get all products
router.get("/all", (req, res) => {
   
  Product.find()
    .then((products) => {
      
      if (!products || products.length === 0) {
        return res.status(404).json({ notFound: "No products found" });
      }
      res.json(products);
    })
    .catch((err) => res.status(500).json({ error: `Server Error: ${err}` }));
});

// Get a single product by ID
// Get a single product by custom id
router.get("/:id", (req, res) => {
  const productId = parseInt(req.params.id);

  // Query by custom field 'id' instead of '_id'
  Product.findOne({ id: productId })
    .then((product) => {
      if (!product) {
        return res.status(404).json({ notFound: "Product not found" });
      }
      res.json(product);
    })
    .catch((err) => res.status(500).json({ error: `Server Error: ${err}` }));
});


// Get products by price range
router.get("/price-range", (req, res) => {
  const { minPrice, maxPrice } = req.query;

  if (!minPrice || !maxPrice) {
    return res.status(400).json({ error: "Please provide minPrice and maxPrice query parameters" });
  }

  Product.find({ price: { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) } })
    .then((products) => {
      if (!products || products.length === 0) {
        return res.status(404).json({ notFound: "No products found within the given price range" });
      }
      res.json(products);
    })
    .catch((err) => res.status(500).json({ error: `Server Error: ${err}` }));
});

module.exports = router;
