
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { default: axios } = require('axios');
const User = require('../../Models/UserModel');
const KudaWallets = require('../../Models/KudaModel');


const kuda_auth = async () => {

    let data = await axios.post(`https://kuda-openapi.kuda.com/v2/Account/GetToken`, {
        "email": "uniconneteam@gmail.com",
        "apiKey": "Iu4oAJYM3Z8Qbi2Kdpnv"
    })
        .then(res => {

            return res.data
        })
        .catch(err => {
            console.log(err.err)
        })

    return data
}

const create_kuda_wallet = async (u) => {

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

    axios.post(process.env.KUDA_BASE_URL, {
        "serviceType": "ADMIN_CREATE_VIRTUAL_ACCOUNT",
        "requestRef": u.hiyalo_id,
        "data": {
            "Email": u.email,
            "FirstName": u.first_name.trim(),
            "LastName": u.last_name.trim(),
            "MiddleName": "Main", //
            "PhoneNumber": u.phone ? u.phone : "09133498864",
            "TrackingReference": u.hiyalo_id,
            "BusinessName": `${u.first_name.trim()} ${u.last_name.trim()} - Hiyalo`
        }
    }, {
        'headers': {
            'Authorization': `Bearer ${await kuda_auth()}`
        }
    })
        .then(result => {

            console.log(result.data)
            let wallet = {
                user_id: u._id,
                account_number: result.data.data.accountNumber,
                bank_name: "Kuda MFB",
                account_name: u.full_name,
                balance: "0",
                meta: result.data.data,
                hiyalo_id: u.hiyalo_id
            }

            let wall = new KudaWallets(wallet)

            wall.save()
                .then(w => {
                    console.log({
                        message: "Wallet Created",
                        id: w._id,
                        user: u._id
                    })
                })
                .catch(err => {
                    console.log("wallet creation err", err)
                })
        })
        .catch(err => {
            console.log("Kuda Api error", err)
        })

}

const create_k_wallet_util = async (hiyalo_id) => {

    User.findOne({ hiyalo_id })
        .then(user => {

            KudaWallets.findOne({ user_id: user._id })
                .then(wall => {
                    if (wall) {
                        return
                    } else {
                        create_kuda_wallet(user)
                    }
                })


            return user

        })
        // .then(u => {
        //     res.json({
        //         message: "Request Completed",
        //     })
        // })
        .catch(err => {

        })

}

const create_wallets = async (req, res) => {

    User.find()
        .then(users => {

            for (var i = 0; i < users.length; i++) {
                let u = users[i]

                KudaWallets.findOne({ user_id: u._id })
                    .then(wall => {
                        if (wall) {
                            return
                        } else {
                            create_kuda_wallet(u)
                        }
                    })

            }


            return users

        })
        .then(u => {
            res.json({
                message: "Request Completed",
            })
        })
        .catch(err => {

        })

}

const kuda_webhook = async (req, res) => {

    console.log(req.body)
    let body = req.body

    if (body.transactionType.toLowerCase().includes('credit')) {

        if (body.narrations !== "U-Pay Charges x") {

            KudaWallets.findOne({
                account_number: req.body.accountNumber
            })
                .then(k_w => {
                    User.findById(k_w.user_id)
                        .then(user_x => {

                            let new_balance = {
                                balance: parseInt(user_x.balance) + (parseInt(body.amount) / 100) - ((parseInt(body.amount) / 100) >= 10000 ? 50 : 0)
                            }
                            let transact = {
                                amount: (parseInt(body.amount) / 100),
                                status: "success",
                                type: body.transactionType.toLowerCase(),
                                name: `Fund U-Pay Wallet ${body.senderName !== "JOHN ALALADE" ? body.senderName : "- U Pay Inter"}`,
                                user_id: user_x._id,
                                meta: body,
                            }

                            if ((parseInt(body.amount) / 100) >= 10000) {
                                let transact1 = {
                                    amount: parseInt(50),
                                    status: "success",
                                    type: 'debit',
                                    name: "Debit U-Pay Wallet Stamp duty",
                                    user_id: user_x._id,
                                    meta: body,
                                }
                                let transaction1 = new Transaction(transact1)

                                transaction1.save()
                                    .then(t => {

                                    })
                                    .catch(err => {

                                    })
                            }

                            let transaction = new Transaction(transact)

                            User.findByIdAndUpdate(user_x._id, {
                                $set: new_balance
                            })
                                .then(up_data => {
                                    axios.post('https://exp.host/--/api/v2/push/send', {
                                        "to": user_x.expoPushToken,
                                        "title": `Wallet Funded 💸 🙌`,
                                        "body": `Your Uniconne wallet just received ₦${(parseInt(body.amount) / 100).toFixed(2)
                                            .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`,
                                        "sound": "default",
                                        "priority": "high",
                                        "data": {
                                            url: `uniconne://user?u_id=${user_x._id}`
                                        }
                                        // "badge": 1
                                    })
                                        .then(res => {
                                            console.log(res.data)
                                        })
                                        .catch(err => {
                                            console.log({
                                                note_err: err
                                            })
                                        })

                                    transaction.save()
                                        .then(t => {

                                        })
                                        .catch(err => {

                                        })
                                })

                        })
                })
                .catch(err => {

                })
        }
    }
    if (body.transactionType.toLowerCase().includes('reversal')) {

        KudaWallets.findOne({
            account_number: req.body.accountNumber
        })
            .then(k_w => {
                User.findById(k_w.user_id)
                    .then(user_x => {

                        let new_balance = {
                            balance: parseInt(user_x.balance) + (parseInt(body.amount) / 100)
                        }
                        let transact = {
                            amount: (parseInt(body.amount) / 100),
                            status: "success",
                            type: body.transactionType.toLowerCase(),
                            name: "Fund U-Pay Wallet",
                            user_id: user_x._id,
                            meta: body,
                        }

                        let transaction = new Transaction(transact)

                        User.findByIdAndUpdate(user_x._id, {
                            $set: new_balance
                        })
                            .then(up_data => {
                                axios.post('https://exp.host/--/api/v2/push/send', {
                                    "to": user_x.expoPushToken,
                                    "title": `Wallet Funded - reversal 💸 🙌`,
                                    "body": `Your Uniconne wallet just received ₦${(parseInt(body.amount) / 100).toFixed(2)
                                        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}`,
                                    "sound": "default",
                                    "priority": "high",
                                    "data": {
                                        url: `uniconne://user?u_id=${user_x._id}`
                                    }
                                    // "badge": 1
                                })
                                    .then(res => {
                                        console.log(res.data)
                                    })
                                    .catch(err => {
                                        console.log({
                                            note_err: err
                                        })
                                    })

                                transaction.save()
                                    .then(t => {

                                    })
                                    .catch(err => {

                                    })
                            })

                    })
            })
            .catch(err => {

            })

    }
    if (body.transactionType.toLowerCase().includes('debit')) {

    }


    res.sendStatus(200)
}

const get_banks = async () => {

    axios.post(process.env.KUDA_BASE_URL, {
        "serviceType": "BANK_LIST",
        "requestRef": uuidv4(),
    }, {
        'headers': {
            'Authorization': `Bearer ${await kuda_auth()}`
        }
    })
        .then(data => {
            console.log({
                data: data.data.data.banks.map(b => {
                    return {
                        code: b.bankCode,
                        name: b.bankName
                    }
                })
            })
        })
        .catch(err => {
            console.log({
                error: err
            })
            console.log({
                err: err.response
            })
        })

}

const resolve_bank = async () => {

    axios.post(process.env.KUDA_BASE_URL, {
        "serviceType": "NAME_ENQUIRY",
        "requestRef": uuidv4(),
        "data": {
            "beneficiaryAccountNumber": '9917926535',
            "beneficiaryBankCode": "090360",
            // "senderTrackingReference": "JOHN",
            // "isRequestFromVirtualAccount": "TRUE"
        },
    }, {
        'headers': {
            'Authorization': `Bearer ${await kuda_auth()}`
        }
    })
        .then(data => {
            console.log(data.data)
            // console.log({
            //     message: data.data.status,
            //     data: data.data.data.BeneficiaryName
            // })
        })
        .catch(err => {
            console.log({
                error: err
            })
            console.log({
                err: err.response
            })
        })

}

const make_transfer = async (receiver_id, amount, sender_hiyalo_id) => {

    let dd = await KudaWallets.findOne({ user_id: receiver_id })
        .then(async (wallet_re) => {

            let d = await axios.post(process.env.KUDA_BASE_URL, {
                "serviceType": "VIRTUAL_ACCOUNT_FUND_TRANSFER",
                "requestRef": `${uuidv4()}-${wallet_re.
                    hiyalo_id}`,
                "data": {
                    "beneficiaryAccount": wallet_re.account_number,
                    "beneficiaryBankCode": '090267',
                    "amount": `${Number(amount) * 100}`,
                    "trackingReference": sender_hiyalo_id,
                    // "beneficiaryName": req.body.account_name,
                    "narration": "U-Pay Payments",
                    // "clientFeeCharge": "20", // If you intend to charge your customers for every transfer done with this endpoint, add the charge amount here
                    // "SenderName": "Custom Sender"
                },
            }, {
                'headers': {
                    'Authorization': `Bearer ${await kuda_auth()}`
                }
            })
                .then(data => {
                    console.log({
                        data: data.data
                    })
                    return {
                        data: data.data
                    }
                })
                .catch(err => {
                    console.log({ error: err.error })
                })

            return d
        })

    return dd
}

const make_internal_transfer = async (receiver_id, amount, sender_hiyalo_id) => {
    let dd = await KudaWallets.findOne({ user_id: receiver_id })
        .then(async (wallet_re) => {

            axios.post(process.env.KUDA_BASE_URL, {
                "serviceType": "WITHDRAW_VIRTUAL_ACCOUNT",
                "requestRef": `${uuidv4()}-inter-${sender_hiyalo_id}`,
                "data": {
                    "amount": `${Number(amount) * 100}`,
                    "trackingReference": sender_hiyalo_id,
                    "narration": "U-Pay Inter",
                },
            }, {
                'headers': {
                    'Authorization': `Bearer ${await kuda_auth()}`
                }
            })
                .then(async (send_to_main) => {

                    console.log({
                        send_to_main: send_to_main.data
                    })

                    axios.post(process.env.KUDA_BASE_URL, {
                        "serviceType": "FUND_VIRTUAL_ACCOUNT",
                        "requestRef": `${uuidv4()}-returns-${wallet_re.hiyalo_id}`,
                        "data": {
                            "amount": `${Number(amount) * 100}`,
                            "trackingReference": wallet_re.hiyalo_id,
                            "narration": "U-Pay Inter",
                        },
                    }, {
                        'headers': {
                            'Authorization': `Bearer ${await kuda_auth()}`
                        }
                    })
                        .then(async (fund_receiver) => {

                            console.log({
                                fund_receiver: fund_receiver.data
                            })

                            return {
                                message: "success",
                                details: "Complete"
                            }
                        })
                        .catch(err => {
                            console.log({ error_fund: err.error })
                        })
                })
                .catch(err => {
                    console.log({ error_send: err.error })
                })

        })
        .catch(err => {
            console.log({ error_db: err.error })
            return {
                message: "error",
                details: "Db error"
            }
        })

    return dd
}

const test_transfers = async () => {

    axios.post(process.env.KUDA_BASE_URL, {
        "serviceType": "WITHDRAW_VIRTUAL_ACCOUNT",
        "requestRef": `${uuidv4()}-payer`,
        "data": {
            // "beneficiaryAccount": '3001187338',
            // "beneficiaryBankCode": '090267',
            "amount": `${Number(3) * 100}`,
            "trackingReference": "JOHN",
            // "beneficiaryName": req.body.account_name,
            "narration": "U-Pay Payments",
            // "clientFeeCharge": "20", // If you intend to charge your customers for every transfer done with this endpoint, add the charge amount here
            // "SenderName": "Custom Sender"
        },
    }, {
        'headers': {
            'Authorization': `Bearer ${await kuda_auth()}`
        }
    })
        .then(data => {
            console.log({
                data: data.data
            })
            return {
                data: data.data
            }
        })
        .catch(err => {
            console.log({ error: err.error })
        })

}

module.exports = {
    kuda_auth, create_kuda_wallet, create_k_wallet_util, create_wallets, kuda_webhook, get_banks, resolve_bank, make_transfer, make_internal_transfer, test_transfers
}