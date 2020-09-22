const express = require('express');
const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://tahmid:526628Tahmid@test1.mbzeo.mongodb.net/FroomVroom?retryWrites=true&w=majority")
const db = mongoose.connection;

const commentsChema = mongoose.Schema({
    question: {
        type: String
    },
    person: {
        type: String
    },
    personImage: {
        type: String
    },
    productId: {
        type: String
    },
    replies: {
        type: Array
    },
    date: {
        type: Date
    }
});

const Comment = module.exports = mongoose.model('Comment', commentsChema);

module.exports.insertComment = (newComment, callback) => {
    newComment.save(callback);
}

module.exports.findComments = (condition, callback) => {
    Comment.find(condition, callback);
}