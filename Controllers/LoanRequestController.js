const LoanRequests = require("../Models/LoanRequestModel")


const start_loan_request = async (req, res) => {

}

const get_user_loan_request = async (req, res) => {

    const { user_id } = req.body
    LoanRequests.find({ user_id })
        .then(loans => {

            res.status(200).json({
                message: 'Loan requests fetched',
                loan_requests: loans
            })

        })
        .catch(err => {
            res.status(400).json({
                message: 'Error fetching user loan requests'
            })
        })
}

module.exports = {
    start_loan_request, get_user_loan_request
}