const User = require("../Models/UserModel")
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const { send_sms } = require("../utils/sms_util");
const { create_kuda_wallet, create_k_wallet_util } = require("../utils/Kuda/KudaServices");
const { mailer } = require("../utils/mailer");
const jwt = require('jsonwebtoken');
const KudaWallets = require("../Models/KudaModel");


// Auths
const register_user = async (req, res) => {

    const { first_name, last_name, email, phone, password } = req.body

    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let generate_code = (length) => {
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    let code = generate_code(4).trim()

    let user = new User({ ...req.body, hiyalo_id: code })

    User.findOne({ email })
        .then(found_user => {
            if (found_user) {
                res.status(409).json({
                    message: "User with email already exists, try logging in.",
                })
            } else {
                user.save()
                    .then(saved_user => {
                        let token = jwt.sign({ user: { id: saved_user._id, } }, process.env.HIYALO_SECRETE)

                        let mail_body = ``

                        mailer(email, 'Welcome To Hiaylo Fam 💜', mail_body)

                        res.status(201).json({
                            message: "User created successfully",
                            token,
                            email,
                            phone,
                            user_id: saved_user._id,
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(400).json({
                            message: "Error creating user, please try again."
                        })
                    })
            }
        })
        .catch(err => {
            res.status(400).json({
                message: "Error creating user, please try again."
            })
        })

}
const login_user = async (req, res) => {

    const { user_name, password } = req.body

    User.findOne({ $or: [{ email: user_name }, { phone: user_name }] })
        .then(user_ => {
            if (user_) {
                bcrypt.compare(password, user_.password, function (err, result) {
                    if (err) {
                        res.status(400).json({
                            message: "Error authenticating user"
                        })
                    }
                    if (result) {
                        let token = jwt.sign({ user: { id: user_._id, } }, process.env.HIYALO_SECRETE)

                        res.status(200).json({
                            message: "User logged in successfully",
                            token,
                            email: user_.email,
                            phone: user_.phone,
                            user_id: user_._id,
                        })
                    } else {
                        res.status(409).json({
                            message: "Password Does Not Match, Try froget password with the same email."
                        })
                    }
                })
            } else {
                res.status(404).json({
                    message: "No user with email found"
                })
            }
        })
        .catch(err => {
            res.status(400).json({
                message: "Error authenticating user"
            })
        })
}
const phone_number_verification_code = async (req, res) => {

    const { phone, user_id } = req.body

    let characters = '012345678909876543210123456789';

    let generate_code = (length) => {
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    let code = generate_code(6).trim()

    let message = `Please input code to verify phone number: ${code}`
    send_sms(phone, message)

    User.findByIdAndUpdate(user_id, {
        $set: {
            phone,
            phone_verification_code: code
        }
    })
        .then(user_ => {
            res.status(200).json({
                message: "Verification code sent"
            })
        })
        .catch(err => {
            res.status(400).json({
                message: "Error saving phone number"
            })
        })

}
const phone_verification = async (req, res) => {

    const { code, user_id } = req.body

    User.findById(user_id)
        .then(user_ => {
            if (user_?.phone_verification_code === code) {
                create_k_wallet_util(user_.hiyalo_id)
                res.status(200).json({
                    message: "Phone number verified successfully"
                })
            } else {
                res.status(400).json({
                    message: "Invalid verification code"
                })
            }
        })
        .catch(err => {
            res.status(400).json({
                message: "Error verifiying phone number, please try again."
            })
        })

}
const google_auth = async (req, res) => {

    const { auth_token } = req.body

    const ticket = await client.verifyIdToken({
        idToken: auth_token,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    let general_data = ticket.getPayload()

    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let generate_code = (length) => {
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    let code = generate_code(4).trim()

    let user_data = {
        first_name: general_data.given_name,
        last_name: general_data.family_name,
        email: general_data.email,
        auth_method: 'google_auth',
        g_id: general_data.sub,
        auth_data: general_data,
        hiyalo_id: code
    }

    let user = new User(user_data)

    User.findOne({ email: user_data.email })
        .then(found_user => {
            if (found_user) {
                res.status(409).json({
                    message: "User with email already exists, try logging in with email and password combination.",
                })
            } else {
                user.save()
                    .then(saved_user => {
                        let token = jwt.sign({ user: { id: saved_user._id, } }, process.env.HIYALO_SECRETE)

                        res.status(201).json({
                            message: "User created successfully",
                            token,
                            email: user_data.email,
                            user_id: saved_user._id,
                        })
                    })
                    .catch(err => {
                        res.status(400).json({
                            message: "Error creating user, please try again."
                        })
                    })
            }
        })
        .catch(err => {
            res.status(400).json({
                message: "Error creating user, please try again."
            })
        })

}

// Recoveries
const send_forget_password_code = async (req, res) => {

    const { email } = req.body

    User.findOne({ email })
        .then(found_user => {

            if (found_user) {
                let characters = '012345678909876543210123456789';

                let generate_code = (length) => {
                    let result = '';
                    const charactersLength = characters.length;
                    for (let i = 0; i < length; i++) {
                        result += characters.charAt(Math.floor(Math.random() * charactersLength));
                    }

                    return result;
                }

                let code = generate_code(6).trim()

                User.findByIdAndUpdate(found_user._id, {
                    $set: {
                        forgot_password_code: code
                    }
                })
                    .then(updated_user => {

                        let mail_body = `
                        <p>Hello ${found_user.first_name}</p>
                        <p>Please use the code below to reset your password:</p>

                        <p><b>${code}</b></p>

                        <p>Please reach out to support at hello@hiyalo.com if you did not initiate this request</p>
                        `

                        mailer(email, 'Reset Password Request', mail_body)

                        res.status(200).json({
                            message: "Password request initiated, please check your mail to get completion code"
                        })

                    })
                    .catch(err => {
                        res.status(400).json({
                            message: "Error getting user, please try again."
                        })
                    })
            }
            else {
                res.status(404).json({
                    message: "No user with email found"
                })
            }
        })
        .catch(err => {
            res.status(400).json({
                message: "Error getting user, please try again."
            })
        })

}
const reset_password = async (req, res) => {

    const { reset_code, password, email } = req.body

    User.findOne({ email })
        .then(found_user => {
            if (found_user) {
                if (found_user.forgot_password_code === reset_code) {
                    bcrypt.hash(password, 10, function (err, hashedPass) {
                        if (err) {
                            res.status(400).json({
                                message: "Error setting password."
                            })
                        }

                        User.findByIdAndUpdate(found_user._id, {
                            $set: {
                                password: hashedPass,
                                forgot_password_code: "null"
                            }
                        })
                            .then(updated_user => {

                                res.status(200).json({
                                    message: "Password updated successfully"
                                })
                            })
                            .catch(err => {
                                res.status(400).json({
                                    message: 'Error updating password, please try again'
                                })
                            })
                    })
                } else {
                    res.status(400).json({
                        message: "Invalid password reset code"
                    })
                }
            } else {
                res.status(404).json({
                    message: "No user with email found"
                })
            }
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error fetching user, please try again'
            })
        })
}

// User activities
const get_user_details = async (req, res) => {

    User.findById(req.body.user_id)
        .then(found_user => {
            if (found_user) {

                res.status(200).json({
                    message: "User data fetched",
                    user_data: found_user
                })

            } else {
                res.status(404).json({
                    message: "No user with email found"
                })
            }
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error fetching user, please try again'
            })
        })
}
const get_user_wallet = async (req, res) => {

    const { user_id } = req.body

    KudaWallets.findOne({ user_id })
        .then(wallet => {
            if (wallet) {
                res.status(200).json({
                    message: "Wallet fetched",
                    wallet
                })
            } else {
                res.status(404).json({
                    message: "No wallet found"
                })
            }
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error fetching user, please try again'
            })
        })
}


module.exports = {
    // Auth
    register_user, login_user, phone_number_verification_code, phone_verification, google_auth,

    // Recoveries
    send_forget_password_code, reset_password,

    // User activities
    get_user_details,
    get_user_wallet
}