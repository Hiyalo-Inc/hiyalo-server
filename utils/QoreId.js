const { default: axios } = require('axios')

const authorize = async () => {
    const data = await axios
        .post('https://api.qoreid.com/token', {
            clientId: process.env.QORE_CLIENT_KEY,
            secret: process.env.QORE_SEC_KEY,
        })
        .then((res) => {
            return {
                message: 'success',
                data: res.data.accessToken,
            }
        })
        .catch((err) => {
            console.log({
                err: err.response,
            })

            return {
                message: 'failed',
                err,
            }
            // res.json({
            //   message: 'failed',
            //   err,
            // })
        })

    return data
}

const qore_nin_verification = async (nin) => {
    const token = await authorize()

    const data = await axios
        .post(
            `https://api.qoreid.com/v1/ng/identities/nin/${nin}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token.data}`,
                },
            }
        )
        .then((res) => {

            console.log(res.data.nin.firstname)
            return {
                message: 'success',
                data: res.data,
            }

        })
        .catch((err) => {
            console.log({
                err: err.response.data,
            })
            // throw new Error(JSON.stringify('Nin Not Validated.'))
            // res.json({
            //     message: "failed",
            //     err
            // })
        })

    return data
}

const qore_bvn_verification = async (nin) => {
    const token = await authorize()

    const data = await axios
        .post(
            `https://api.qoreid.com/v1/ng/identities/nin/${nin}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token.data}`,
                },
            }
        )
        .then((res) => {
            return {
                message: 'success',
                data: res.data,
            }
        })
        .catch((err) => {
            console.log({
                err,
            })
            // throw new Error(JSON.stringify('Nin Not Validated.'))
            // res.json({
            //     message: "failed",
            //     err
            // })
        })

    return data
}

const qore_driver_license_verification = async (license_num) => {
    const token = await authorize()

    const data = await axios
        .post(
            `https://api.qoreid.com/v1/ng/identities/drivers-license/${license_num}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token.data}`,
                },
            }
        )
        .then((res) => {
            return {
                message: 'success',
                data: res.data,
            }
        })
        .catch((err) => {
            console.log({
                err,
            })
            // throw new Error(JSON.stringify('Nin Not Validated.'))
            // res.json({
            //     message: "failed",
            //     err
            // })
        })

    return data
}

const qore_voters_card_verification = async (card_num) => {
    const token = await authorize()

    const data = await axios
        .post(
            `https://api.qoreid.com/v1/ng/identities/vin/${card_num}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token.data}`,
                },
            }
        )
        .then((res) => {
            return {
                message: 'success',
                data: res.data,
            }
        })
        .catch((err) => {
            console.log({
                err,
            })
            // throw new Error(JSON.stringify('Nin Not Validated.'))
            // res.json({
            //     message: "failed",
            //     err
            // })
        })

    return data
}

const qore_international_passport_verification = async (passport_num) => {
    const token = await authorize()

    const data = await axios
        .post(
            `https://api.qoreid.com/v1/ng/identities/passport/${passport_num}`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token.data}`,
                },
            }
        )
        .then((res) => {
            return {
                message: 'success',
                data: res.data,
            }
        })
        .catch((err) => {
            console.log({
                err,
            })
            // throw new Error(JSON.stringify('Nin Not Validated.'))
            // res.json({
            //     message: "failed",
            //     err
            // })
        })

    return data
}

module.exports = {
    qore_nin_verification, qore_driver_license_verification, qore_voters_card_verification, qore_international_passport_verification
}
