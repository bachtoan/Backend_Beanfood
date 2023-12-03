const { default: mongoose } = require("mongoose");
var db = require("./db");

const notifySchema = new mongoose.Schema(
  {
    idProduct: { type: mongoose.Schema.ObjectId, ref: "productModel" },
    
    idUser: { type: mongoose.Schema.ObjectId, ref: "userModel" },
    title: String,
  },
  {
    collection: "comments",
    timestamps: true,
  }
);
notifyModel = db.mongoose.model("notifyModel", notifySchema);
module.exports = {
  notifyModel,
};
