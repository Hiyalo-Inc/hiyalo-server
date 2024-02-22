const FeedbackController = require('../Controllers/FeedbackController.ts')

const express = require('express')

const route = express.Router()

route.post('/submit', FeedbackController.submit_feedback)

module.exports = route

