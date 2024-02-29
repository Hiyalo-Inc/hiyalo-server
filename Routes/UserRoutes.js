const UserController = require('../Controllers/UserController')


const authenticate = require('../Middlewares/authenticate')
const upload = require('../Middlewares/upload')

const expres = require('express')

const route = expres.Router()

// Auths
route.post('/register', UserController.register_user)
route.post('/login', UserController.login_user)
route.post('/send-phone-verification-code', UserController.phone_number_verification_code)
route.post('/verify-phone', UserController.phone_verification)
route.post('/google-auth', UserController.google_auth)

// Recoveries
route.post('/send-password-code', UserController.send_forget_password_code)
route.post('/reset-password', UserController.reset_password)

// User
route.post('/get-user', authenticate, UserController.get_user_details)

module.exports = route