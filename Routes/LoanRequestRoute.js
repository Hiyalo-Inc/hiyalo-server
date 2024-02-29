const LoanRequestController = require('../Controllers/LoanRequestController.js')


const authenticate = require('../Middlewares/authenticate')
const upload = require('../Middlewares/upload')

const express = require('express')

const route = express.Router()

route.post('/get-user-loan-requests', authenticate, LoanRequestController.get_user_loan_request)

module.exports = route

