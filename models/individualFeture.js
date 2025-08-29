const mongoose = require('mongoose');
const IndividualFeatureSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    features:{       
            fetchBatteryStatus:{type:Boolean, default: true},
            fetchNetworkStatus:{type:Boolean, default:true},
             locationTracking: { type: Boolean, default: false },
             locationTrackingInterval:{type:String,default:"10"}        
    }
});
module.exports = mongoose.model('IndividualFeature',IndividualFeatureSchema);