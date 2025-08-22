const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{type: String},
    email:{type: String,required: true,uniquie:true}
})

module.exports = mongoose.model('User', userSchema);