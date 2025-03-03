const mongoose = require('mongoose');
const Users = require('../models/users')

const reservationsSchema = mongoose.Schema({
name : String,
users: [{type: mongoose.Schema.Types.ObjectId, ref:'users'}], 
date: Date, 
conversation : {type: mongoose.Schema.Types.ObjectId, ref:'conversations'},
})

const Reservations = mongoose.model('reservations', reservationsSchema)
module.exports = Reservations;