const {
    GMAIL_EMAIL,
    CLIENT_ID,
    CLIENT_SECRET,
    REFRESH_TOKEN,
    SENDER_EMAIL,
} = require('../config/google_configs')
const nodemailer = require('nodemailer')

const mailer = (receiver, subject, mailBody) => {
    const transport = nodemailer.createTransport({
        // Service
        service: 'Gmail',
        // Auth
        auth: {
            type: 'OAuth2',
            // Email use to send email (Your Google Email. Eg: xxx@gmail.com)
            user: GMAIL_EMAIL,
            // Get in Google Console API (GMAIL API)
            clientId: CLIENT_ID,
            // Get in Google Console API (GMAIL API)
            clientSecret: CLIENT_SECRET,
            // Get from Google OAuth2.0 Playground (Using Cliet ID & Client Secret Key)
            refreshToken: REFRESH_TOKEN,
        },
    })

    const mailOptions = {
        // Email should be SAME as USER EMAIL above
        from: `Hiyalo Technologies <${SENDER_EMAIL}>`,
        // ANY Email to send the mail (to send to many use ',' inside the single quote. Eg: 'xxx@gmail.com, xxx@yahoo.com')
        to: receiver,
        subject,
        // TEXT cannot apply any HTML Elements (use either TEXT or HTML)
        // text: 'Hey there, it’s our first message sent with Nodemailer ',
        // HTML can apply any HTML Elements (use either TEXT or HTML)
        html: mailBody,
    }

    transport
        .sendMail(mailOptions)
        .then((success) => console.log('Successful!'))
        .catch((err) => {
            console.log('Unsuccesful!')
            console.log(err.message)
        })
}


module.exports = { mailer }