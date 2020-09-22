const express = require('express');
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://tahmid:526628Tahmid@test1.mbzeo.mongodb.net/FroomVroom?retryWrites=true&w=majority")

const categorySchema = mongoose.Schema({
    category_name: {
        type: String
    },
    subcategory: {
        type: Array
    }
}, {collection: 'categories'})


const Category = module.exports = mongoose.model('Category', categorySchema);

module.exports.createCategory = (newCat, callback) => {
    newCat.save(callback);
}

module.exports.addSubCategory = (cat, subCat, callback) => {
    Category.update({category_name: cat}, {$push: {subcategory: subCat}}, callback);
}

module.exports.findCategory = (condition, callback) => {
    Category.find(condition, callback);
}