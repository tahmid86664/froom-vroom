const express = require('express');
const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://tahmid:526628Tahmid@test1.mbzeo.mongodb.net/FroomVroom?retryWrites=true&w=majority")
const db = mongoose.connection;

const productSchema = mongoose.Schema({
    product_title: {
        type: String
    },
    product_category: {
        type: String
    },
    product_price: {
        type: String
    },
    product_description: {
        type: String
    },
    product_image: {
        type: String
    },
    sold: {
        type: Number
    }
}, {collection: 'products'});



const Product = module.exports = mongoose.model('Product', productSchema);

module.exports.insertProduct = (newProduct, callback) => {
    newProduct.save(callback);
}

module.exports.findProducts = (condition, callback) => {
    Product.find(condition, callback);
}

module.exports.updateProduct = (condition, updateQuery, callback) => {
    Product.update(condition, updateQuery, callback);
}

