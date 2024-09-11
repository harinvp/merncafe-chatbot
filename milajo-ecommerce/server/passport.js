const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");

// called on login, saves the id to session req.session.passport.user = {id:'..'}
passport.serializeUser(async (user, done) => {

  done(null, { _id: user._id });
});

// user object attaches to the request as req.user
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findOne({ _id: id }, "username");

    done(null, user);
  } catch (err) {
    done(err);
  }
});

const strategy = new LocalStrategy(
  { usernameField: "username" },
  async function (username, password, done) {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { error: "Incorrect username" });
      }
      if (!user.checkPassword(password)) {
        return done(null, false, { error: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);

passport.use(strategy);

module.exports = passport;
