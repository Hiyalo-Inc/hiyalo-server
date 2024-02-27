const Feedback = require("../Models/FeedbackModel")
const { mailer } = require("../utils/mailer")

const submit_feedback = async (req, res) => {

    const { name, text, email, phone } = req.body

    let data = {
        name, text, email, phone
    }

    let feedback = new Feedback(data)

    feedback.save()
        .then(feed => {

            let mail_body = `
            <p>Hello Deborah,</p>
            <p>Sure you are great, please find below details of feedback from customer.</p>
            <p>Do well to review and respond as the case maybe.</p>
            <p><b>Customer Name:</b> ${name} </p>
            <p><b>Customer Email:</b> ${email} </p>
            <p><b>Customer Phone:</b> ${phone} </p>
            <p><b>Feedback:</b> ${text}</p>

            <p>Kind regards,<p>
            <p><b>Hiyalo tech team</b></p>
            `
            let mail_body_customer = `
            <p>Hello ${name},</p>
            <p>Thank you for your feedback on Hiyalo, believe us your feedback helps us serve you better🫂.</p>
            <p>This mail is to confrim that we have received your feedback and we will act on them promptly.</p>
            <br/>
            <p>Thank you for being part of the Hiyalo Fam💜</p>

            <p>Kind regards,</p>
            <p>Hiyalo House</p>
            `

            mailer(['deborah.benjamin@hiyalo.com'], "Customer Feedback", mail_body)
            mailer(email, "Feedback Received", mail_body_customer)
            res.status(200).json({
                message: "success",
                feedback: feed
            })
        })
        .catch(err => {

            res.status(400).json({
                message: "error",
                details: "There was an error saving feedback"
            })
        })

}

module.exports = {
    submit_feedback
}