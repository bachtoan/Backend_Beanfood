const { default: mongoose } = require("mongoose");
var db = require("./db");

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
      },
      listFavorite: [
        {
          productId: {
            type: String,
            required: true,
          },
          restaurantId: {
            type: String,
            required: true,
          },
          isLiked: {
            type: Boolean,
            default: false,
          },
        },
      ],
  });
  
favoriteModel = db.mongoose.model("favoriteModel", favoriteSchema);
module.exports = {
  favoriteModel,
};
