const LoanRequestController = require('../Controllers/LoanRequestController.js')


const authenticate = require('../Middlewares/authenticate')
const upload = require('../Middlewares/upload')

const express = require('express')

const route = express.Router()


route.post('/start-application', authenticate, LoanRequestController.start_loan_request)

route.post('/laon-identification', authenticate, LoanRequestController.loan_request_identification)
route.post('/id-upload', authenticate, upload.single("file"), LoanRequestController.loan_request_id_upload)

route.post('/utility-bill-upload', authenticate, upload.single("file"), LoanRequestController.utility_document_upload)
route.post('/bank-statement-upload', authenticate, upload.single("file"), LoanRequestController.bank_statement_upload)
route.post('/employement-doc-upload', authenticate, LoanRequestController.employment_document_upload)


route.post('/employment-status-submit', authenticate, LoanRequestController.employment_status)

route.post('/rent-details-submit', authenticate, LoanRequestController.rent_details)

route.post('/loan-details-submit', authenticate, LoanRequestController.loan_details)

route.post('/list-banks', authenticate, LoanRequestController.loan_details)
route.post('/verify-account-name', authenticate, LoanRequestController.loan_details)
route.post('/bank-details-submit', authenticate, LoanRequestController.loan_details)

route.post('/get-user-loan-requests', authenticate, LoanRequestController.get_user_loan_request)

module.exports = route

