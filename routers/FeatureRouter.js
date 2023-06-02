const express = require("express");
const FeatureController = require('../controllers/FeatureController')

const router = express.Router()

router.get("/", FeatureController.main_get);

router.post("/create-message", FeatureController.create_message_post)

router.post('/deletemessage/:id', FeatureController.deletemessage_delete)

router.get('/membership', FeatureController.membership_get)

router.post('/membership', FeatureController.membership_post)

module.exports = router