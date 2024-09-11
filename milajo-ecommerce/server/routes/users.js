const express = require("express");
const router = express.Router();
const User = require("../models/User");
const passport = require("../passport");

const isSignedUp = async (req, res, next) => {
  const { username } = req.body;
  try {
    const registered = await User.findOne({ username });
    if (registered) {
      res.json({
        error: `A user already exists with the username: ${username}`,
      });
      return;
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const signUpUser = async (req, res, next) => {
  const { username, password, name, email, address } = req.body;
  try {
    const newUser = new User({
      username,
      password: password,
      name: name,
      email: email,
      address: address,
    });
    await newUser.save();
    res
      .status(201)
      .json({ success: "Signed up successfully, you can now login." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = (req, res) => {
  req.login(req.user, function (err) {
    if (err) {
      res.json({ error: err });
    }
    req.session.username = req.user.username;
    const userToReturn = { ...req.user._doc }; // Copy user details
    delete userToReturn.password; // Remove password from the details sent to client
    return res.send(userToReturn);
  });
};

const logout = (req, res) => {
  req.logout(function (err) {
    if (err) {
      return res.send({ error: "no user to log out" });
    }
    res.send({ success: "logged out" });
  });
};

router.post("/signup", isSignedUp, signUpUser);

router.post("/login", passport.authenticate("local"), login);

router.post("/logout", logout);

module.exports = router;
