const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Middleware to protect routes with Passport authentication
const authenticate = (req, res, next) => {

  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  const { username } = req.params; // This captures the username from the route parameter

  if (req.session.username !== username) {
    return res
      .status(403)
      .json({ error: "Access denied: You can only access your own orders" });
  }

  next(); // Proceed if authenticated and authorized
};

//Insert Order
router.post("/add", (req, res) => {
  Order.create(req.body)
    .then((order) => res.json({ msg: "Order added successfully", order }))
    .catch((err) =>
      
      res.status(400).json({ error: `Unable to add this order ${err}` })
    );
});

// Get all orders by username
router.get("/user/:username", authenticate, (req, res) => {
  const username = req.params.username;
  Order.find({ username: username })
    .then((orders) => {
      if (!orders || orders.length === 0) {
        return res
          .status(404)
          .json({ notFound: "No Orders found for this user" });
      }
      res.json(orders);
    })
    .catch((err) => res.status(500).json({ error: `Server Error: ${err}` }));
});

module.exports = router;

