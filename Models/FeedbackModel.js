const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    text: {
        type: String
    },
    addressed: {
        type: String
    },

}, { timestamps: true })



const Feedback = mongoose.model('Feedback', feedbackSchema)
module.exports = Feedback