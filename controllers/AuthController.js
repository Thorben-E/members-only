const passport = require('../passport')
const { body, validationResult } = require('express-validator')

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

exports.signup_post = (req, res) => {
  body('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password')
    }

    return true
  }),
  async (req, res, next) => {
    console.log('ho')
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
};}

exports.login = (req, res) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",

    // It seems like this flag (or `failureFlash`) must be enabled
    // in order to actually do anything with the error info you pass
    // as the third argument to `done()` in `localStrategyCallback`
    failureMessage: true,
  })
};