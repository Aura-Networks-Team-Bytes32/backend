const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase:true},
  merchantId: { type: String, required:true,unique:true },
  pkpPublicKey: {type:String, required:true, unique:true},
  merchantEOA:{ type:String, required:true, unique:true}
});

module.exports = mongoose.model("Merchant", merchantSchema);
