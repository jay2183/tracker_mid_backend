// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//     name:{type: String},
//     email:{type: String,required: true,uniquie:true}
// })

// module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    userType: { 
        type: String, 
        enum: ['company', 'individual', 'pending'], // 'pending' for users who haven't set their type
        default: 'pending' 
    },
    profileId: { 
        type: mongoose.Schema.Types.ObjectId, 
        refPath: 'userType', // Dynamically references CompanyProfile or IndividualProfile
        default: null 
    }
});

module.exports = mongoose.model('User', userSchema);