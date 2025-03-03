const mongoose = require ('mongoose');


const usersSchema = mongoose.Schema({
username: String, 
firstname: String, 
lastname: String,
token: String

})

const Users = mongoose.model('users', usersSchema)
module.exports = Users;