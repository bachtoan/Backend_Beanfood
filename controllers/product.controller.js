var productModel = require("../models/product.model");

const firebase = require("../firebase/index.js");
const { error } = require("firebase-functions/logger");

exports.getSuggest = async (req, res, next) => {
  try {

    const list = await productModel.productModel.find().populate('restaurantId');
    const data = list.map((product) => {
      const restaurantName = product.restaurantId.name;
      // Thêm tên nhà hàng vào đối tượng sản phẩm
      return { ...product._doc };
    });


    if (list) {
      return res
        .status(200)
        .json({ data: data, msg: "Lấy dữ liệu thành công" });
    } else {
      return res.status(400).json({ msg: "Không có dữ liệu" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.deleteProduct = async (req, res, next) => {
  const id = req.params.id;
  try {
    const product = await productModel.productModel.findByIdAndDelete({
      _id: id,
    });

    if (!product) {
      return res.status(204).json({ msg: "Sản phẩm không tồn tại" });
    }
    res.redirect("/showProduct");
  } catch (error) {
    return res.status(204).json({ msg: error.message });
  }
};
exports.editProduct = async (req, res, next) => {
  const id = req.params.id;
  const product = await productModel.productModel.findById({
    _id: id,
  });
  return product;
};
exports.dataProductRestaurant = async (req, res, next) => {
  const id = req.session.user?._id;
  try {
    let list = await productModel.productModel.find({
      restaurantId: id,
    });
    console.log(list);
    if (list) {
      return list;
    } else {
      return res.status(400).json({ msg: "Lay du lieu san pham thanh cong" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.getProductInRestaurant = async (req, res, next) => {
  const restaurantId = req.params.id;
  try {
    const list = await productModel.productModel.find({ restaurantId }).populate('restaurantId');
    console.log(list);
    if (list) {
      return res
        .status(200)
        .json({ data: list, msg: "Lay du lieu san pham thanh cong" });
    } else {
      return res.status(400).json({ msg: "Lay du lieu san pham thanh cong" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
exports.getProduct = async (req, res, next) => {
  try {
    const product = await productModel.productModel.findById(req.params.id);

    if (!product) {
      return res.status(204).json({ msg: "Sản phẩm không tồn tại" });
    }

    res.status(200).json(product);
  } catch (error) {
    return res.status(204).json({ msg: error.message });
  }
};
exports.getProductByName = async (req, res, next) => {
  const productName = req.body.name;
  try {
    const products = await productModel.productModel.find({
      name: { $regex: productName, $options: "i" },
    });

    if (products.length === 0) {
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm nào." });
    }

    res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.editDataProduct = async (req, res, next) => {
  const id = req.session.user?._id;
  const idProduct = req.params.id;
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
    productModel.productModel
      .findByIdAndUpdate({ _id: idProduct }, product)
      .then(() => {
        res.redirect("/showProduct");
      });
  });
  blobWriter.end(req.file.buffer);
};
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
    productModel.productModel.create(product).then(() => {
      res.redirect("/showProduct");
    });
  });
  blobWriter.end(req.file.buffer);
};

// web

exports.getListProduct = async (req, res, next) => {
  try {
    const products = await productModel.productModel.find();
    console.log(products);
    res.render("product/listProduct", { list: products, req: req });
  } catch (error) {
    return res.status(204).json({ msg: error.message });
  }
};

// lấy theo danh mục 
exports.getProductDanhMuc = async (req, res, next) => {
  try {
    const nameDanhMuc = req.params.category;
    const products = await productModel.productModel.find({category: nameDanhMuc});
    console.log("đạt ngu",products);
    return res.status(200).json({products});
  } catch (error) {
    return res.status(204).json({ msg: error.message });
  }
};
