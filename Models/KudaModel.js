const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const KudaSchema = new mongoose.Schema({
    user_id: {
        type: String
    },
    account_number: {
        type: String
    },
    bank_name: {
        type: String
    },
    account_name: {
        type: String
    },
    balance: {
        type: String
    },
    hiyalo_id: {
        type: String
    },
    meta: {
        type: Object
    }

}, { timestamps: true })



const KudaWallets = mongoose.model('KudaWallets', KudaSchema)
module.exports = KudaWallets