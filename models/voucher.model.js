const { default: mongoose } = require("mongoose");
var db = require("./db");

const voucherSchema = new mongoose.Schema(
  {
    name: String,
    hsd: { type: Date },
    money: Number,
    quantity: Number,
    image: String,
    limit: Number,
    isHetHan: { type: Boolean, default: false },
    restaurantId: { type: mongoose.Schema.ObjectId, ref: "restaurantModel" },
  },
  {
    collection: "vouchers",
    timestamps: true,
  }
);
voucherModel = db.mongoose.model("voucher", voucherSchema);
module.exports = {
  voucherModel,
};
