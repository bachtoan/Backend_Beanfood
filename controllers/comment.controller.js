require("../models/product.model");
var commentModel = require("../models/comment.model");
exports.getComment = async (req, res, next) => {
  const idProduct = req.body.idProduct;
  try {
    let list = await commentModel.commentModel
      .find({
        idProduct: idProduct,
      })
      .populate({ path: "idUser", select: "username avatar" })
      .populate({ path: "idProduct", select: "name images _id" })
      .exec();
    if (list) {
      return res
        .status(200)
        .json({ data: list, msg: "Lấy  dữ liệu comment thành công" });
    } else {
      return res.status(400).json({ msg: "Không có dữ liệu" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
exports.getAllComment = async (req, res, next) => {
  try {
    let list = await commentModel.commentModel
      .find()
      .populate({ path: "idUser", select: "username avatar" })
      .populate({ path: "idProduct", select: "name images _id" })
      .exec();
    return list;
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.postComment = async (req, res, next) => {
  console.log(req.body);
  try {
    const comment = new commentModel.commentModel(req.body);

    let new_comment = await comment.save();

    return res.status(200).json({ comment: new_comment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error.message });
  }
};
