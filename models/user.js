const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://tahmid:526628Tahmid@test1.mbzeo.mongodb.net/FroomVroom?retryWrites=true&w=majority")
const db = mongoose.connection

const bcrypt = require('bcryptjs')

//user schema
const userSchema = mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    mobile:{
        type: String
    },
    address:{
        type: String
    },
    profile_image: {
        type: String
    },
    purchase: {
        type: Array
    }
}, {collection: 'users'});


const User = module.exports = mongoose.model('User', userSchema)

module.exports.createUser = (newUser, callback) => {
    let salt = Math.floor(Math.random() * 10)
    bcrypt.hash(newUser.password, salt, (err, hashPass) => {
        if(err) throw err
        newUser.password = hashPass

        //save the user
        newUser.save(callback)
    })
}

module.exports.findUserByUsername = (username, callback) => {
    let query = {username: username} // the query to find username
    User.findOne(query, callback) // this method find with the query
}

module.exports.findUserById = (id, callback) => {
    User.findById(id, callback)
}

module.exports.comparePassword = (candidatePassword, hashPass, callback) => {
    bcrypt.compare(candidatePassword, hashPass, (err, isMatch) => {
        if(err){
            return callback(err)
        }
        return callback(null, isMatch)
    })
}

module.exports.updateUsername = (condition, updateQuery, callback) => {
    User.update(condition, updateQuery, callback);
}
