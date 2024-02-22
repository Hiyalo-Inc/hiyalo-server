const http = require('http')
const app = require('./setup/app.ts')
const {db_init} = require('./setup/mongo_setup.ts')
require('dotenv').config();

const port = process.env.PORT || 4000

const server = http.createServer(app)

db_init()

server.listen(port, () => {
    console.log(`Server running on port: ${port}✅`)
})