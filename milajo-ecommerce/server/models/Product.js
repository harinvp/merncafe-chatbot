const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  imageName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  category: {
    type: String, // Optional: Add if you want to categorize products
  },
  stock: {
    type: Number, // Optional: Add if you want to track stock levels
    default: 0,
  },
  size:
  {
    type:[Number],
    default:[]
  }
 
}, { collection: 'products' });

module.exports = Product = mongoose.model("product", ProductSchema);
