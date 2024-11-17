const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase:true},
    otp: { type: Number, required: true, unique: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("otp", otpSchema);