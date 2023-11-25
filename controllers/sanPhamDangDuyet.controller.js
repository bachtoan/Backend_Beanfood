var sanPhamDangDuyetModel = require("../models/sanPhamDangDuyet.model.js");
const firebase = require("../firebase/index.js");
exports.addProduct = async (req, res, next) => {
  const id = req.session.user?._id;
  const nameFile = req.file.originalname;
  const blob = firebase.bucket.file(nameFile);
  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  blobWriter.on("finish", () => {
    const product = {
      ...req.body,
      realPrice: Number.parseInt(req.body.realPrice),
      discountPrice: Number.parseInt(req.body.discountPrice),
      quantityInStock: Number.parseInt(req.body.quantityInStock),
      description: "Mon an ngon",
      restaurantId: id,
      image: `https://firebasestorage.googleapis.com/v0/b/datn-de212.appspot.com/o/${nameFile}?alt=media&token=d890e1e7-459c-4ea8-a233-001825f3c1ae`,
    };
    sanPhamDangDuyetModel.sanPhamDangDuyetModel.create(product).then(() => {
      res.redirect("/showProduct");
    });
  });
  blobWriter.end(req.file.buffer);
};
