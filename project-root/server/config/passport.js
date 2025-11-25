const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Use environment variable for callback to support different hosts/ports
      // Allow either GOOGLE_CALLBACK_URL or GOOGLE_REDIRECT env names (project used both)
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || process.env.GOOGLE_REDIRECT || `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`,
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            passwordHash: null,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
