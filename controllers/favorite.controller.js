require("../models/product.model");
var favoriteModel = require("../models/favorite.model");
exports.getFavorite = async (req, res, next) => {
  console.log(req.body);
  try {
    let list = await favoriteModel.favoriteModel
      .find()
      .populate({ path: "idProduct", select: "name images" })
      .exec();
    if (list) {
      return res
        .status(200)
        .json({ data: list, msg: "Lấy  dữ liệu favorite thành công" });
    } else {
      return res.status(400).json({ msg: "Không có dữ liệu" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.postFavorite = async (req, res, next) => {
  try {
    console.log(req.body);
    // favoriteModel.favoriteModel
    //   .find({
    //     userId: req.body.userId,
    //   })
    //   .then((uid) => {
    //     console.log(req.body);
    //   });

    // const favorite = new favoriteModel.favoriteModel(req.body);
    // let new_favorite = await favorite.save();
    // return res.status(200).json({ favoriteList: new_favorite });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error.message });
  }
};
