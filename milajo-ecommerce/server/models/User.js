const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
mongoose.promise = Promise;
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
});
UserSchema.methods = {
  checkPassword: function (inputPassword) {
    return bcrypt.compareSync(inputPassword, this.password);
  },
  hashPassword: (plainTextPassword) => {
    return bcrypt.hashSync(plainTextPassword, 10);
  },
};

UserSchema.pre("save", function (next) {
  if (!this.password) {
    console.log("No password provided");
    next();
  } else {
    this.password = this.hashPassword(this.password);
    console.log("Password hashed.");
    next();
  }
});

module.exports = User = mongoose.model("user", UserSchema);
