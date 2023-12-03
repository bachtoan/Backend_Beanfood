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
            type: mongoose.Schema.ObjectId,
            ref: "Product",
            required: true,
          },
          name: {
            type: String,
            
          },
          image: {
            type: String,
            
          },
          realPrice: {
            type: Number,
          },
          description: {
            type: String,
          },
          restaurantId:{
            type: mongoose.Schema.ObjectId, ref: "restaurantModel"
          },
          isLiked: {
            type: Boolean,
            default: false,
          },
          likeCount: { type: Number, default: 0 },
        },
      ],
  });
  
favoriteModel = db.mongoose.model("favoriteModel", favoriteSchema);
module.exports = {
  favoriteModel,
};
