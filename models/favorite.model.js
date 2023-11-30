const { default: mongoose } = require("mongoose");
var db = require("./db");
const favoriteItem = new mongoose.Schema({
  idProduct: { type: mongoose.Schema.ObjectId, ref: "productModel" },
  favorite: Boolean,
});

const favoriteSchema = new mongoose.Schema(
  {
    listFavorite: [favoriteItem],
    idUser: { type: mongoose.Schema.ObjectId, ref: "userModel" },
  },
  {
    collection: "favorites",
    timestamps: true,
  }
);
favoriteModel = db.mongoose.model("favoriteModel", favoriteSchema);
module.exports = {
  favoriteModel,
};
