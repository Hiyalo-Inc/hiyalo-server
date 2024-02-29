const mongoose = require('mongoose');


const db_init = () => {

    mongoose.connect(process.env.DATABASE_URL);
    const db = mongoose.connection

    db.on('error', (err) => {
        console.log(err)
    })

    db.once('open', () => {
        console.log('Database connection Established 🔗')
    })

}

// { useNewUrlParser: true, useUnifiedTopology: true, }

module.exports = {
    db_init
}