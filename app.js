const express = require("express");
const favicon = require('serve-favicon')
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const morgan = require("morgan");
require('dotenv').config();

const FeatureRouter = require('./routers/FeatureRouter')
const AuthRouter = require('./routers/AuthRouter')

const app = express();
app.use(favicon(path.join(__dirname + '/public/favicon.ico')))
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

app.use('/', FeatureRouter)
app.use('/', AuthRouter)

const port = process.env.PORT ?? 3000;

app.listen(port, () => console.log(`app listening on port ${port}!`));