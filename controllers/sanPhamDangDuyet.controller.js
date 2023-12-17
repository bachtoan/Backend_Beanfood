var sanPhamDangDuyetModel = require("../models/sanPhamDangDuyet.model.js");
const firebase = require("../firebase/index.js");
const { productModel } = require("../models/product.model.js");
var restaurantModel = require("../models/restaurant.model");

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
      description: Number.parseInt(req.body.description),
      description: String(req.body.description),
      restaurantId: id,
      image: `https://firebasestorage.googleapis.com/v0/b/datn-de212.appspot.com/o/${nameFile}?alt=media&token=d890e1e7-459c-4ea8-a233-001825f3c1ae`,
    };
    sanPhamDangDuyetModel.sanPhamDangDuyetModel.create(product).then(() => {
      res.redirect("/showProduct");
    });
  });
  blobWriter.end(req.file.buffer);
};
exports.getListProduct = async (req, res, next) => {
  try {
    const products = await sanPhamDangDuyetModel.sanPhamDangDuyetModel.find({
      trangthai: 0,
    });

    for (let i = 0; i < products.length; i++) {
      const restaurantInfo = await restaurantModel.restaurantModel.findById(
        products[i].restaurantId
      );

      if (restaurantInfo) {
        products[i].restaurantName = restaurantInfo.name;
      }
    }
    res.render("product/listProductCensorship", { list: products, req: req });
  } catch (error) {
    return res.status(204).json({ msg: error.message });
  }
};

exports.duyet = async (req, res, next) => {
  const productId = req.params.id;

  try {
    // Tìm sản phẩm trong bảng sanPhamDangDuyetModel
    const productToApprove =
      await sanPhamDangDuyetModel.sanPhamDangDuyetModel.findById(productId);

    // Thêm sản phẩm vào bảng productModel.productModel
    const newProduct = new productModel({
      _id: productToApprove._id, // Giữ nguyên id của sản phẩm
      name: productToApprove.name,
      image: productToApprove.image,
      description: productToApprove.description,
      quantityInStock: productToApprove.quantityInStock,
      realPrice: productToApprove.realPrice,
      category: productToApprove.category,
      discountPrice: productToApprove.discountPrice,
      restaurantId: productToApprove.restaurantId,
    });

    // Lưu sản phẩm mới vào bảng productModel
    await newProduct.save();

    // Xoá sản phẩm khỏi bảng sanPhamDangDuyetModel
    await sanPhamDangDuyetModel.sanPhamDangDuyetModel.findByIdAndDelete(
      productId
    );
    res.redirect("/censorship");
  } catch (error) {
    res.redirect("/censorship");
  }
};

exports.xoa = async (req, res, next) => {
  const productId = req.params.id;
  try {
    const productToApprove =
      await sanPhamDangDuyetModel.sanPhamDangDuyetModel.findById(productId);

    if (!productToApprove) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    await sanPhamDangDuyetModel.sanPhamDangDuyetModel.updateOne(
      { _id: productId },
      { trangthai: 1 }
    );

    res.redirect("/censorship");
  } catch (error) {
    res.redirect("/censorship");
  }
};

exports.xoa = async (req, res, next) => {
  const productId = req.params.id;
  console.log(productId);
};
exports.listForRes = async (req, res, next) => {
  try {
    const products = await sanPhamDangDuyetModel.sanPhamDangDuyetModel.find({
      restaurantId: req.params.id,
    });

    for (let i = 0; i < products.length; i++) {
      const restaurantInfo = await restaurantModel.restaurantModel.findById(
        products[i].restaurantId
      );

      if (restaurantInfo) {
        products[i].restaurantName = restaurantInfo.name;
      }
    }
    res.render("product/listProductCensorshipRes", {
      list: products,
      req: req,
    });
  } catch (error) {
    return res.status(204).json({ msg: error.message });
  }
};
