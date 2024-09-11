const mongoose = require("mongoose");
require("dotenv").config();

const connString = process.env.CONN_STRING;
console.log(connString)
mongoose.set("strictQuery", true, "useNewUrlParser", true);

const connectDB = async () => {
  try {
    await mongoose.connect(connString);
  } catch (err) {
    console.error(err.message);
  }
};
module.exports = connectDB;
