const { default: mongoose } = require("mongoose");
var db = require("./db");

const productSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    description: String,
    quantityInStock: Number,
    realPrice: Number,
    category: String,
    discountPrice: Number,
    restaurantId: { type: mongoose.Schema.ObjectId, ref: "restaurantModel" },
  },
  {
    collection: "sanphamdangduyet",
    timestamps: true,
  }
);
sanPhamDangDuyetModel = db.mongoose.model(
  "sanPhamDangDuyetModel",
  productSchema
);
module.exports = {
  sanPhamDangDuyetModel,
};
