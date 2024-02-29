const TransactionsController = require('../Controllers/TransactionsController.js')


const authenticate = require('../Middlewares/authenticate')
const upload = require('../Middlewares/upload')

const express = require('express')

const route = express.Router()

route.post('/get-user-transactions', authenticate, TransactionsController.get_user_transaction)

module.exports = route

