const mongoose = require("mongoose");

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
    timestamp: { type: String, required: true },
    user: { type: String, required: true }
  })
)

module.exports = { User, Message }