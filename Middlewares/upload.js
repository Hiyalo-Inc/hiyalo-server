const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid');

// first set storage => file name
const storage = multer.diskStorage({
    // first our destination uploads folder
    destination: function (req, res, cb) {
        cb(null, './uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, 'congar' + '-' + Date.now() + uuidv4() + path.extname(file.originalname))
    }
})

const filerFilter = (req, file, cb) => {
    cb(null, true)
}

let upload = multer({
    storage: storage,
    // fileFilter: filerFilter
})


module.exports = upload