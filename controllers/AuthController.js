const passport = require('../passport')
const { body, validationResult } = require('express-validator')
const { User } = require('../db')
const bcrypt = require('bcryptjs')

exports.signup_get = (req, res) => {
  res.render("sign-up-form", { error: ''})
};

exports.log_out = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

exports.signup_post = [
  body('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      res.render('sign-up-form', { error: 'Password confirmation does not match password'})
    }

    return true
  }),
  async (req, res, next) => {
    const takenUsername = await User.find({ username: req.body.username })
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
    } else if (takenUsername.length > 0) {
      res.render('sign-up-form', { error: 'Username is already in use'})
    }
    //create user
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        next(err);
      } 
      let admin = false
      if (req.body.admin === 'on') {
        admin = true
      } else {
        admin = false
      }

      new User({
        username: req.body.username,
        password: hashedPassword,
        member: false,
        admin: admin
      }).save((err) => {
        if (err) {
          return next(err);
        }

        res.redirect("/");
      });
    })
}];

exports.login = passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureMessage: true,
});