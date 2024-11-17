const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase:true},
  worldIdHash: { type: String, required:true,unique:true },
  debitCardHash: {type:String, required:true, unique:true},
  pkpPublicKey:{ type:String, required:true, unique:true},
  userEOA: { type:String , required:true, unique: true}
});

module.exports = mongoose.model("User", userSchema);
