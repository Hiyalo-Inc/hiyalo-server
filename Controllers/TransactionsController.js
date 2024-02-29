const Transactions = require("../Models/TransactionsModel")


const get_user_transaction = async (req, res) => {

    const { user_id } = req.body
    Transactions.find({ user_id })
        .then(trx => {

            res.status(200).json({
                message: 'Trasactions fetched',
                transactions: trx
            })
        })
        .catch(err => {
            res.status(400).json({
                message: 'Error fetching user transcation'
            })
        })

}

module.exports = {
    get_user_transaction
}