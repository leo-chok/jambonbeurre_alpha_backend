const mongoose = require ('mongoose');
const usersSchema = mongoose.Schema({
// Here is your schema


})
const Users = mongoose.model('users', usersSchema)
module.exports = Users;