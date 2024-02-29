const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const loanRequestSchema = new mongoose.Schema({
    user_id: {
        type: String
    },

    meta: {
        type: Object
    }

}, { timestamps: true })



const LoanRequests = mongoose.model('LoanRequests', loanRequestSchema)
module.exports = LoanRequests