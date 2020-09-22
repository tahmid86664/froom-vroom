const { Double } = require('mongodb');
const multer = require('multer');
const path = require('path');
// product image
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/images/upload/products");
    },

    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})
module.exports.upload = multer({
    storage: storage
}).single('product_img');

// profile image
const storage1 = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/images/upload/profile");
    },

    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})
module.exports.uploadProfileImg = multer({
    storage: storage1
}).single('profile_img');

// for cookies
module.exports.addItemToCookie = false; // permission to set cookies or not

module.exports.productInfo = {
    product_id: {
        type: String
    },
    product_title: {
        type: String
    },
    product_price: {
        type: Double
    },
    product_qty: {
        type: Number
    }
}
