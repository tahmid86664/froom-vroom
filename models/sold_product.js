const express = require('express');
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://tahmid:526628Tahmid@test1.mbzeo.mongodb.net/FroomVroom?retryWrites=true&w=majority")
const db = mongoose.connection;

const soldProduct = mongoose.Schema({
    sold_product_id: {
        type: String
    },
    sold_product_title:{
        type: String
    },
    sold_product_price:{
        type: String
    },
    sold_qty:{
        type: Number
    },
    sold_date: {
        type: Date
    },
    buyer_username:{
        type: String
    },
    buyer_mobile: {
        type: String
    },
    buyer_address: {
        type: String
    }
}, {collection: "sold_products"});


const SoldProduct = module.exports = mongoose.model('SoldProduct', soldProduct);

module.exports.insertProduct = (newProduct, callback) => {
    newProduct.save(callback);
}

module.exports.countProduct = (condition, callback) => {
    SoldProduct.count(condition, callback);
}

module.exports.findSoldProducts = (condition, callback) => {
    SoldProduct.find(condition, callback);
}