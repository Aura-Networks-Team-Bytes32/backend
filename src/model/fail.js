const mongoose = require("mongoose");

const failTxSchema = new mongoose.Schema({
  txHash: { type: String, required: true, unique: true, lowercase:true},
});

module.exports = mongoose.model("FailTxSchema", failTxSchema);
