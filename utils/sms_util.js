const { default: axios } = require('axios')

const send_sms = async (phone, message) => {

    let p = phone.indexOf('0') === 0 ? `234${phone.slice(1)}` : phone.indexOf('234') === 0 ? p : phone.indexOf('+234') === 0 ? phone.slice(1) : p

    const data = await axios.post('https://www.bulksmsnigeria.com/api/v2/sms', {
        from: 'Hiyalo',
        to: p,
        body: message,
        api_token: "cq78nYRDJXm9wWHZWZJDCs390VRUdruq4gjtPqfVlaFfu1irLaAAsx9h6E8R",
        gateway: 'direct-refund'
    })
        .then(res => {
            console.log(res.data)
            return {
                message: res.data.data?.status,
                details: res.data.data
            }
        })
        .catch(err => {
            console.log(err)
            return {
                message: 'failed',
                err,
            }
        })

    return data
}

module.exports = {
    send_sms
}