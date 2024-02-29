const express = require('express')
// import express from 'express'
const cors = require('cors')
const morgan = require('morgan')
const feedbackRoute = require('../Routes/FeedbackRoutes.ts')
const userRoute = require('../Routes/UserRoutes.js')
const loanRequestRoute = require('../Routes/LoanRequestRoute.js')
const transactionsRoute = require('../Routes/TransactionRoutes.js')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan('dev'))

app.use('/feedbacks/', feedbackRoute)
app.use('/user/', userRoute)
app.use('/loan-requests/', loanRequestRoute)
app.use('/transactions/', transactionsRoute)

module.exports = app