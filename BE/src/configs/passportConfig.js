const UserModel = require("../models/User.model");
const { verifyPassword } = require("../utils/passwordUtil");
const { generateToken } = require("../utils/jwt/jwtUtil");
const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const logger = require("./logger");

const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async function (jwt_payload, done) {
    try {
      // Find the user associated with the token
      let user = null;

      // try to find in users table
      if (jwt_payload?.userId)
        user = await UserModel.findById(jwt_payload?.userId);

      // if not found in any of the tables then error
      if (!user) return done("User not found.");

      // Authentication successful
      return done(null, user);
    } catch (err) {
      logger.error(err);
      console.log(err);
      return done(err, false);
    }
  }
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
    // return cb(null, {
    //   id: user.id,
    //   email: user.email,
    // });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

module.exports = () => {
  passport.use(jwtStrategy);
};
