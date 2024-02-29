const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const transactionSchema = new mongoose.Schema({
    user_id: {
        type: String
    },
    amount: {
        type: String
    },
    type: {
        type: String
    },
    status: {
        type: String
    },
    description: {
        type: String
    },
    meta: {
        type: Object
    }

}, { timestamps: true })



const Transactions = mongoose.model('Transactions', transactionSchema)
module.exports = Transactions