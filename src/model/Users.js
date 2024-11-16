const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase:true},
  worldidhash: { type: String, required:true,unique:true },
  debitcardhash: {type:String, required:true, unique:true},
  pkp:{ type:String, required:true, unique:true}
});

module.exports = mongoose.model("User", userSchema);
