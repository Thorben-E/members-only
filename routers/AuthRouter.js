const express = require("express");
const AuthController = require('../controllers/AuthController')

const router = express.Router()

router.get("/sign-up", AuthController.signup_get);

router.get("/log-out", AuthController.log_out);

router.post("/sign-up", AuthController.signup_post);

router.post("/log-in", AuthController.login);

module.exports = router