
const express = require("express");
const router = express.Router();
const passport = require('../controllers/google.js')

router.get(
	"/",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
	"/callback",
	passport.authenticate("google", { failureRedirect: "/login" }),
	function (req, res) {
		// On successful authentication--> redirect to home page
		res.redirect("/listings");
	}
);

module.exports = router;
