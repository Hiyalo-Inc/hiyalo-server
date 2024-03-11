const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const loanRequestSchema = new mongoose.Schema({
    user_id: {
        type: String
    },
    marital_status: {
        type: String
    },
    home_address: {
        type: String
    },
    education: {
        type: String
    },
    state_of_residence: {
        type: String
    },
    guarantor_name: {
        type: String
    },
    guarantor_bvn: {
        type: String
    },
    // 
    id_type: {
        type: String
    },
    id_number: {
        type: String
    },
    id_document: {
        type: Object
    },
    // 
    utility_bill_document: {
        type: Object
    },
    bank_statement_document: {
        type: Object
    },
    employment_letter_document: {
        type: Object
    },
    // 
    employment_status: {
        type: String
    },
    company_name: {
        type: String
    },
    employer_name: {
        type: String
    },
    employer_email: {
        type: String
    },
    job_role: {
        type: String
    },
    salary_amount: {
        type: String
    },
    pay_date: {
        type: String
    },
    // 
    rent_type: {
        type: String
    },
    rent_amount: {
        type: String
    },
    apartment_address: {
        type: String
    },
    landlord_name: {
        type: String
    },
    landlord_phone: {
        type: String
    },
    // 
    loan_amount: {
        type: String
    },
    repayment_duration: {
        type: String
    },
    // 
    bvn: {
        type: String
    },
    bank_name: {
        type: String
    },
    account_number: {
        type: String
    },
    loan_request_progress: {
        type: String
    },
    status: {
        type: String
    },

    meta: {
        type: Object
    }

}, { timestamps: true })



const LoanRequests = mongoose.model('LoanRequests', loanRequestSchema)
module.exports = LoanRequests