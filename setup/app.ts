const express = require('express')
// import express from 'express'
const cors = require('cors')
const morgan = require('morgan')
const feedbackRoute = require('../Routes/FeedbackRoutes.ts')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(morgan('dev'))

app.use('/feedbacks/', feedbackRoute)

module.exports = app