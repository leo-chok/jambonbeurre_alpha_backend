const mongoose = require('mongoose');
//change users en participants
const reservationsSchema = mongoose.Schema({
name : String,
users: [{type: mongoose.Schema.Types.ObjectId, ref:'users'}], 
date: Date, 
chats : {type: mongoose.Schema.Types.ObjectId, ref:'conversations'},
})

const Reservations = mongoose.model('reservations', reservationsSchema)
module.exports = Reservations;