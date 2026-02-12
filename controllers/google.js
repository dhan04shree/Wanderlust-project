
const passport = require("passport");
const User = require("../models/user.js");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;

var GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
	new GoogleStrategy(
		{
			clientID: GOOGLE_CLIENT_ID,
			clientSecret: GOOGLE_CLIENT_SECRET,
			callbackURL: `${GOOGLE_CALLBACK_URL}`,
		},

		async function (accessToken, refreshToken, profile, cb) {
  try {
    let existingUser = await User.findOne({
      $or: [
        { providerId: profile.id },
        { email: profile._json.email }
      ]
    });

    if (existingUser) {
      // If providerId was not set before, update it
      if (!existingUser.providerId) {
        existingUser.providerId = profile.id;
        existingUser.provider = "google";
        await existingUser.save();
      }
      return cb(null, existingUser);
    }

    // Create new user if not found
    const newUser = new User({
      providerId: profile.id,
      provider: "google",
      fName: profile._json.given_name,
      lName: profile._json.family_name,
      email: profile._json.email,
      username:
        profile._json.given_name.toLowerCase() +
        Math.floor(Math.random() * 1000),
      image: {
        url: profile._json.picture.replace("=s96-c", "=s400-c"),
        filename: `google${profile.id}`,
      },
    });

    let savedUser = await newUser.save();
    return cb(null, savedUser);

  } catch (err) {
    return cb(err, null);
  }
}

		
	)
);

module.exports = passport;
