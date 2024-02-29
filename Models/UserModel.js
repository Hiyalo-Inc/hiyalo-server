const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    phone: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    hiyalo_id: {
        type: String
    },
    phone_verification_code: {
        type: String
    },
    phone_verified: {
        type: Boolean
    },
    email_verified: {
        type: Boolean
    },
    auth_mode: {
        type: String
    },
    g_id: {
        type: String
    },
    auth_data: {
        type: Object
    },
    forgot_password_code: {
        type: String
    },
    loan_balance: {
        type: Number
    },
    wallet_balance: {
        type: Number
    },
})

userSchema.pre('save', function (next) {
    if (!this.isModified('password')) return next();

    bcrypt.hash(this.password, 10, (err, hashedpassword) => {
        if (err) return next(err)
        this.password = hashedpassword
        next();
    })
})

const User = mongoose.model('Users', userSchema)
module.exports = User