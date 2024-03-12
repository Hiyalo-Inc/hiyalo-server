const LoanRequests = require("../Models/LoanRequestModel")
const User = require("../Models/UserModel")
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const aws = require('aws-sdk');
const fs = require('fs');


const sharp = require('sharp');
const { qore_nin_verification, qore_voters_card_verification, qore_driver_license_verification, qore_international_passport_verification } = require("../utils/QoreId");
const S3_BUCKET = process.env.S3_BUCKET;
aws.config.region = 'us-east-2'


const start_loan_request = async (req, res) => {

    const { user_id, marital_status, home_address, education, state_of_residence, guarantor_name, guarantor_bvn } = req.body

    let data = {
        user_id,
        marital_status,
        home_address,
        education,
        state_of_residence,
        guarantor_name,
        guarantor_bvn
    }

    let loan = new LoanRequests(data)
    loan.save()
        .then(loan_request => {

            res.status(200).json({
                message: "Loan request started successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error creating loan request, please try again'
            })
        })
}

const loan_request_identification = async (req, res) => {

    const { loan_id, id_type, id_number, user_id } = req.body

    let data = {
        type: "",
        media: "",
        id_data: {},
        verified: false
    }

    const user_data = await User.findById(user_id)

    if (id_type === "NIN") {
        let v_data = await qore_nin_verification(id_number)

        if (v_data.data.nin) {
            if (`${v_data.data.nin.firstname} ${v_data.data.nin.lastname}`
                .toLowerCase()
                .includes(user_data.first_name.toLowerCase().trim())
                &&
                `${v_data.data.nin.firstname} ${v_data.data.nin.lastname}`
                    .toLowerCase()
                    .includes(user_data.last_name.toLowerCase().trim())
            ) {

                data.id_data = v_data.data.nin
                data.verified = true

            } else {
                res.status(400).json({
                    message: "NIN data does not match user details",
                })
                return false
            }

        } else {

        }
    }

    if (id_type === "voters_Card") {
        let v_data = await qore_voters_card_verification(id_number)

        if (v_data.data.voters_card) {
            if (`${v_data.data.voters_card.firstName} ${v_data.data.voters_card.lastName}`
                .toLowerCase()
                .includes(user_data.first_name.toLowerCase().trim())
                &&
                `${v_data.data.voters_card.firstName} ${v_data.data.voters_card.lastName}`
                    .toLowerCase()
                    .includes(user_data.last_name.toLowerCase().trim())
            ) {

                data.id_data = v_data.data.voters_card
                data.verified = true

            } else {
                res.status(400).json({
                    message: "Votar's card data does not match user details",
                })
            }

        } else {

        }
    }

    if (id_type === "drivers_license") {
        let v_data = await qore_driver_license_verification(id_number)

        if (v_data.data.drivers_license) {
            if (`${v_data.data.drivers_license.firstname} ${v_data.data.drivers_license.lastname}`
                .toLowerCase()
                .includes(user_data.first_name.toLowerCase().trim())
                &&
                `${v_data.data.drivers_license.firstname} ${v_data.data.drivers_license.lastname}`
                    .toLowerCase()
                    .includes(user_data.last_name.toLowerCase().trim())
            ) {

                data.id_data = v_data.data.drivers_license
                data.verified = true

            } else {
                res.status(400).json({
                    message: "Driver's license data does not match user details",
                })
            }

        } else {

        }
    }

    if (id_type === "international_passport") {
        let v_data = await qore_international_passport_verification(id_number)

        if (v_data.data.passport) {
            if (`${v_data.data.passport.firstname} ${v_data.data.passport.lastname}`
                .toLowerCase()
                .includes(user_data.first_name.toLowerCase().trim())
                &&
                `${v_data.data.passport.firstname} ${v_data.data.passport.lastname}`
                    .toLowerCase()
                    .includes(user_data.last_name.toLowerCase().trim())
            ) {

                data.id_data = v_data.data.passport
                data.verified = true

            } else {
                res.status(400).json({
                    message: "Passport data does not match user details",
                })
            }

        } else {

        }
    }


    if (req.file) {
        let file = req.file

        let src = `https://gigvee.s3.us-east-2.amazonaws.com/${uuidv4()}`

        if (file.mimetype.includes("image")) {

            data.type = "image"
            data.media = src

            sharp(file.path)
                // .resize({
                //     fit: "contain"
                // })
                .jpeg({ mozjpeg: true, quality: 40, })
                .withMetadata()
                .toBuffer()
                .then(data => {
                    const s3 = new aws.S3();
                    const s3Params = {
                        Bucket: S3_BUCKET,
                        Key: src.slice(42),
                        Body: data,
                        // Expires: 180,
                        ContentDisposition: "attachment;",
                        ContentType: file.mimetype,
                        ACL: 'public-read'
                    };
                    s3.putObject(s3Params, function (s3Err, data) {
                        if (s3Err) throw s3Err

                        console.log('File uploaded successfully at -->')
                        fs.unlink(file.path, (err) => {
                            if (err) console.log('Unable to delete used file ' + err)
                            else console.log('file deleted')
                        })

                    })
                })
        } else {
            data.type = "document"
            data.media = src

            fs.readFile(file.path, (err, data) => {
                if (err) throw err;
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: src.slice(42),
                    Body: data,
                    // Expires: 180,
                    ContentDisposition: "attachment;",
                    ContentType: file.mimetype,
                    // file.mimetype,
                    ACL: 'public-read'
                };
                s3.putObject(s3Params, function (s3Err, data) {
                    if (s3Err) throw s3Err

                    console.log('File uploaded successfully at --> ' + data.Location)
                    fs.unlink(file.path, (err) => {
                        if (err) console.log('Unable to delete used file ' + err)
                        else console.log('file deleted')
                    })

                })

            })

        }
    }

    LoanRequests.findByIdAndUpdate(loan_id, {
        $set: {
            id_type,
            id_number,
            id_document: data,
            id_data: data.id_data,
            id_verified: data.verified
        }
    })
        .then(loan_request => {
            res.status(200).json({
                message: "ID verified successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error saving ID, please try again'
            })
        })
}

const loan_request_id_upload = async (req, res) => {

    const { loan_id } = req.body

    let data = {
        type: "",
        media: ""
    }

    if (req.file) {
        let file = req.file

        let src = `https://gigvee.s3.us-east-2.amazonaws.com/${uuidv4()}`

        if (file.mimetype.includes("image")) {

            data.type = "image"
            data.media = src

            sharp(file.path)
                // .resize({
                //     fit: "contain"
                // })
                .jpeg({ mozjpeg: true, quality: 40, })
                .withMetadata()
                .toBuffer()
                .then(data => {
                    const s3 = new aws.S3();
                    const s3Params = {
                        Bucket: S3_BUCKET,
                        Key: src.slice(42),
                        Body: data,
                        // Expires: 180,
                        ContentDisposition: "attachment;",
                        ContentType: file.mimetype,
                        ACL: 'public-read'
                    };
                    s3.putObject(s3Params, function (s3Err, data) {
                        if (s3Err) throw s3Err

                        console.log('File uploaded successfully at -->')
                        fs.unlink(file.path, (err) => {
                            if (err) console.log('Unable to delete used file ' + err)
                            else console.log('file deleted')
                        })

                    })
                })
        } else {
            data.type = "document"
            data.media = src

            fs.readFile(file.path, (err, data) => {
                if (err) throw err;
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: src.slice(42),
                    Body: data,
                    // Expires: 180,
                    ContentDisposition: "attachment;",
                    ContentType: file.mimetype,
                    // file.mimetype,
                    ACL: 'public-read'
                };
                s3.putObject(s3Params, function (s3Err, data) {
                    if (s3Err) throw s3Err

                    console.log('File uploaded successfully at --> ' + data.Location)
                    fs.unlink(file.path, (err) => {
                        if (err) console.log('Unable to delete used file ' + err)
                        else console.log('file deleted')
                    })

                })

            })

        }
    }


    LoanRequests.findByIdAndUpdate(loan_id, {
        $set: {
            id_document: data,
        }
    })
        .then(loan_request => {
            res.status(200).json({
                message: "Id document uploaded successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error saving documents, please try again'
            })
        })

}

const all_document_upload = async (req, res) => {

    const { loan_id } = req.body

    LoanRequests.findByIdAndUpdate(loan_id, {
        $set: {
            utility_bill_document: "",
            bank_statement_document: "",
            employment_letter_document: ""
        }
    })
        .then(loan_request => {
            res.status(200).json({
                message: "Documents uploaded successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error saving documents, please try again'
            })
        })
}

const utility_document_upload = async (req, res) => {

    const { loan_id } = req.body

    let data = {
        type: "",
        media: ""
    }

    if (req.file) {
        let file = req.file

        let src = `https://gigvee.s3.us-east-2.amazonaws.com/${uuidv4()}`

        if (file.mimetype.includes("image")) {

            data.type = "image"
            data.media = src

            sharp(file.path)
                // .resize({
                //     fit: "contain"
                // })
                .jpeg({ mozjpeg: true, quality: 40, })
                .withMetadata()
                .toBuffer()
                .then(data => {
                    const s3 = new aws.S3();
                    const s3Params = {
                        Bucket: S3_BUCKET,
                        Key: src.slice(42),
                        Body: data,
                        // Expires: 180,
                        ContentDisposition: "attachment;",
                        ContentType: file.mimetype,
                        ACL: 'public-read'
                    };
                    s3.putObject(s3Params, function (s3Err, data) {
                        if (s3Err) throw s3Err

                        console.log('File uploaded successfully at -->')
                        fs.unlink(file.path, (err) => {
                            if (err) console.log('Unable to delete used file ' + err)
                            else console.log('file deleted')
                        })

                    })
                })
        } else {
            data.type = "document"
            data.media = src

            fs.readFile(file.path, (err, data) => {
                if (err) throw err;
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: src.slice(42),
                    Body: data,
                    // Expires: 180,
                    ContentDisposition: "attachment;",
                    ContentType: file.mimetype,
                    // file.mimetype,
                    ACL: 'public-read'
                };
                s3.putObject(s3Params, function (s3Err, data) {
                    if (s3Err) throw s3Err

                    console.log('File uploaded successfully at --> ' + data.Location)
                    fs.unlink(file.path, (err) => {
                        if (err) console.log('Unable to delete used file ' + err)
                        else console.log('file deleted')
                    })

                })

            })

        }
    }


    LoanRequests.findByIdAndUpdate(loan_id, {
        $set: {
            utility_bill_document: data,
        }
    })
        .then(loan_request => {
            res.status(200).json({
                message: "Utility bill uploaded successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error saving documents, please try again'
            })
        })

}

const bank_statement_upload = async (req, res) => {

    const { loan_id } = req.body

    let data = {
        type: "",
        media: ""
    }

    if (req.file) {
        let file = req.file

        let src = `https://gigvee.s3.us-east-2.amazonaws.com/${uuidv4()}`

        if (file.mimetype.includes("image")) {

            data.type = "image"
            data.media = src

            sharp(file.path)
                // .resize({
                //     fit: "contain"
                // })
                .jpeg({ mozjpeg: true, quality: 40, })
                .withMetadata()
                .toBuffer()
                .then(data => {
                    const s3 = new aws.S3();
                    const s3Params = {
                        Bucket: S3_BUCKET,
                        Key: src.slice(42),
                        Body: data,
                        // Expires: 180,
                        ContentDisposition: "attachment;",
                        ContentType: file.mimetype,
                        ACL: 'public-read'
                    };
                    s3.putObject(s3Params, function (s3Err, data) {
                        if (s3Err) throw s3Err

                        console.log('File uploaded successfully at -->')
                        fs.unlink(file.path, (err) => {
                            if (err) console.log('Unable to delete used file ' + err)
                            else console.log('file deleted')
                        })

                    })
                })
        } else {
            data.type = "document"
            data.media = src

            fs.readFile(file.path, (err, data) => {
                if (err) throw err;
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: src.slice(42),
                    Body: data,
                    // Expires: 180,
                    ContentDisposition: "attachment;",
                    ContentType: file.mimetype,
                    // file.mimetype,
                    ACL: 'public-read'
                };
                s3.putObject(s3Params, function (s3Err, data) {
                    if (s3Err) throw s3Err

                    console.log('File uploaded successfully at --> ' + data.Location)
                    fs.unlink(file.path, (err) => {
                        if (err) console.log('Unable to delete used file ' + err)
                        else console.log('file deleted')
                    })

                })

            })

        }
    }


    LoanRequests.findByIdAndUpdate(loan_id, {
        $set: {
            bank_statement_document: data,
        }
    })
        .then(loan_request => {
            res.status(200).json({
                message: "Bank statement uploaded successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error saving documents, please try again'
            })
        })

}

const employment_document_upload = async (req, res) => {

    const { loan_id } = req.body

    let data = {
        type: "",
        media: ""
    }

    if (req.file) {
        let file = req.file

        let src = `https://gigvee.s3.us-east-2.amazonaws.com/${uuidv4()}`

        if (file.mimetype.includes("image")) {

            data.type = "image"
            data.media = src

            sharp(file.path)
                // .resize({
                //     fit: "contain"
                // })
                .jpeg({ mozjpeg: true, quality: 40, })
                .withMetadata()
                .toBuffer()
                .then(data => {
                    const s3 = new aws.S3();
                    const s3Params = {
                        Bucket: S3_BUCKET,
                        Key: src.slice(42),
                        Body: data,
                        // Expires: 180,
                        ContentDisposition: "attachment;",
                        ContentType: file.mimetype,
                        ACL: 'public-read'
                    };
                    s3.putObject(s3Params, function (s3Err, data) {
                        if (s3Err) throw s3Err

                        console.log('File uploaded successfully at -->')
                        fs.unlink(file.path, (err) => {
                            if (err) console.log('Unable to delete used file ' + err)
                            else console.log('file deleted')
                        })

                    })
                })
        } else {
            data.type = "document"
            data.media = src

            fs.readFile(file.path, (err, data) => {
                if (err) throw err;
                const s3 = new aws.S3();
                const s3Params = {
                    Bucket: S3_BUCKET,
                    Key: src.slice(42),
                    Body: data,
                    // Expires: 180,
                    ContentDisposition: "attachment;",
                    ContentType: file.mimetype,
                    // file.mimetype,
                    ACL: 'public-read'
                };
                s3.putObject(s3Params, function (s3Err, data) {
                    if (s3Err) throw s3Err

                    console.log('File uploaded successfully at --> ' + data.Location)
                    fs.unlink(file.path, (err) => {
                        if (err) console.log('Unable to delete used file ' + err)
                        else console.log('file deleted')
                    })

                })

            })

        }
    }

    LoanRequests.findByIdAndUpdate(loan_id, {
        $set: {
            employment_letter_document: data,
        }
    })
        .then(loan_request => {
            res.status(200).json({
                message: "Employment data uploaded successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error saving documents, please try again'
            })
        })

}

const employment_status = async (req, res) => {

    const { loan_id, employment_status, company_name, employer_name, employer_email, job_role, salary_amount, pay_date } = req.body

    LoanRequests.findByIdAndUpdate(loan_id, {
        $set: {
            employment_status,
            company_name,
            employer_name,
            employer_email,
            job_role,
            salary_amount,
            pay_date
        }
    })
        .then(loan_request => {
            res.status(200).json({
                message: "Employment data uplaoded successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error saving employment data, please try again'
            })
        })
}

const rent_details = async (req, res) => {
    const { loan_id, rent_type, rent_amount, apartment_address, landlord_name, landlord_phone } = req.body

    LoanRequests.findByIdAndUpdate(loan_id, {
        $set: {
            rent_type,
            rent_amount,
            apartment_address,
            landlord_name,
            landlord_phone
        }
    })
        .then(loan_request => {
            res.status(200).json({
                message: "Rent data uplaoded successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error saving rent data, please try again'
            })
        })
}

const loan_details = async (req, res) => {

    const { loan_id, loan_amount, repayment_duration } = req.body

    LoanRequests.findByIdAndUpdate(loan_id, {
        $set: {
            loan_amount,
            repayment_duration
        }
    })
        .then(loan_request => {
            res.status(200).json({
                message: "Loan details uplaoded successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error saving loan details, please try again'
            })
        })
}

const bank_details = async (req, res) => {

    const { loan_id, bvn, bank_name, account_number } = req.body

    LoanRequests.findByIdAndUpdate(loan_id, {
        $set: {
            bvn,
            bank_name,
            account_number
        }
    })
        .then(loan_request => {
            res.status(200).json({
                message: "Bank details uplaoded successfully.",
                loan_request
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error saving loan details, please try again'
            })
        })
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
    start_loan_request,
    loan_request_identification, loan_request_id_upload,

    all_document_upload, utility_document_upload, bank_statement_upload, employment_document_upload, employment_status, rent_details, loan_details, bank_details,
    get_user_loan_request,
}