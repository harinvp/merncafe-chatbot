const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },

  items: {
    type: [String],
    required: true,
  },
  count: {
    type: Number,
  },
  price: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  placed_date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
  },
});

module.exports = Order = mongoose.model("order", OrderSchema);
