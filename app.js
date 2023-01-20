const express = require("express");
const { body, validationResult } = require('express-validator')
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
require('dotenv').config();

const Schema = mongoose.Schema;

const mongoConnectionUrl = process.env.MONGODB_URI;
mongoose.connect(mongoConnectionUrl, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Mongo connection error"));
db.on("open", console.log.bind(console, "Mongo connection opened"));

const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    member: { type: Boolean, required: true },
    admin: { type: Boolean, required: true }
  })
);

const Message = mongoose.model(
  "Message",
  new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, required: true },
    user: { type: String, required: true }
  })
)

const localStrategyCallback = (username, password, done) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false, { message: "Incorrect username" });
    }

    bcrypt.compare(password, user.password, (err, res) => {
      if (err) {
        return done(err);
      }

      if (res) {
        return done(null, user);
      }

      return done(null, false, { message: "Incorrect password" });
    });
  });
}

passport.use(new LocalStrategy(localStrategyCallback));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// ! This takes the session error message Passport added to req.session
// ! And adds it to res.locals so we can access it in our views
app.use((req, res, next) => {
  if (req.session.messages) {
    res.locals.errorMessage = req.session.messages.at(-1);

    // To see why we're accessing the last index in the `messages` array, try:
    // console.log(req.session.messages)
  }
  next();
});

app.get("/", async (req, res, next) => {
  try {
    let admin = false
    let member = false
    if (res.locals.currentUser) {
      if (res.locals.currentUser.member === true) {
        member = true
      } 
      if (res.locals.currentUser.admin === true) {
        admin = true
      }
    }
    const messages = await Message.find().sort([["timestamp", "descending"]]).populate("user");
    return res.render('index', { 
      messages: messages,
      admin: admin,
      member: member
    })
  } catch (err) {
    return next(err);
  }
});

app.get("/sign-up", (req, res) => {
  res.render("sign-up-form", { error: ''})
});

app.get("/log-out", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post(
  "/sign-up",
  body('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password')
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
});

app.post("/log-in", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/",

  // It seems like this flag (or `failureFlash`) must be enabled
  // in order to actually do anything with the error info you pass
  // as the third argument to `done()` in `localStrategyCallback`
  failureMessage: true,
}));

app.post("/create-message", (req, res, next) => {
  const dateFormat = Date.now()
  new Message({
    title: req.body.title,
    message: req.body.message,
    timestamp: dateFormat,
    user: res.locals.currentUser.username
  }).save((err) => {
    if (err) {
      return next(err)
    }
    res.redirect('/')
  })
  console.log('message created')
})

app.get('/membership', (req, res) => {
  res.render('membership')
})

app.post('/membership', (req, res, next) => {
  console.log(res.locals.currentUser)
  if (req.body.answer !== process.env.MEMBER_PW) {
    res.render('membership', { errMessage: "Wrong password"})
  } else {
    User.findByIdAndUpdate(res.locals.currentUser._id,{ $set:{ "member": true }}, {},
    function(err, result) {
      if (err) return next(err)
      res.redirect('/')
    })
  }
})

app.post('/deletemessage/:id', (req, res, next) => {
  Message.findByIdAndDelete(req.params.id)
    .then(() => res.redirect('/'))
})

const port = process.env.PORT ?? 3000;

app.listen(port, () => console.log(`app listening on port ${port}!`));