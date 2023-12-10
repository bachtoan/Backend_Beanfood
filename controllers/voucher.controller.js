require("../models/restaurant.model.js");
var voucherModel = require("../models/voucher.model.js");
const moment = require("moment");
const firebase = require("../firebase/index.js");
exports.getVoucher = async (req, res, next) => {
  const id = req.session.user?._id;
  try {
    const currentTime = moment();
    const list = await voucherModel.voucherModel.find({
      restaurantId: id,
      hsd: { $lt: currentTime.toISOString() },
    });
    return list;
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.tinhtoansovoucherhethang = async (req, res, next) => {
  const id = req.session.user?._id;
  try {
    const currentTime = moment();
    const list = await voucherModel.voucherModel.find({
      restaurantId: id,
      hsd: { $lt: currentTime.toISOString() },
    });
    res.json({
      quantityHetHang: list?.length,
    });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
exports.handleDecreseVoucher = async (req, res, next) => {
  const id = req.body.idVoucher;
  try {
    const voucher = await voucherModel.voucherModel.findById({ _id: id });
    if (!voucher) {
      return res.status(404).json({ msg: "Voucher not found" });
    }
    if (voucher.quantity == 0) {
      await voucherModel.voucherModel.findByIdAndDelete({ _id: id });
      return res.json({
        status: 200,
        message: "Số lượng voucher đã  hết",
      });
    }
    if (voucher.quantity > 0) {
      voucher.quantity--;
      const updatedVoucher = await voucher.save();
      return res.json(updatedVoucher);
    } else {
      return res.status(400).json({ msg: "Voucher is out of stock" });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.deleteVoucher = async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  try {
    await voucherModel.voucherModel.findByIdAndDelete({ _id: id });
    res.redirect("/listvoucher");
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
exports.detailVoucher = async (req, res, next) => {
  const id = req.params.id;

  const voucher = await voucherModel.voucherModel.findById({
    _id: id,
  });
  return voucher;
};
exports.editVoucher = async (req, res, next) => {
  const idVoucher = req.params.id;
  const id = req.session.user?._id;

  const nameFile = req.file.originalname;
  const blob = firebase.bucket.file(nameFile);
  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  blobWriter.on("finish", () => {
    const voucher = {
      ...req.body,
      money: Number.parseInt(req.body.voucherPrice),
      name: req.body.nameVoucher,
      hsd: String(req.body.voucherDate),
      restaurantId: id,
      quantity: Number.parseInt(req.body.quantity),
      limit: Number.parseInt(req.body.limit),

      image: `https://firebasestorage.googleapis.com/v0/b/datn-de212.appspot.com/o/${nameFile}?alt=media&token=d890e1e7-459c-4ea8-a233-001825f3c1ae`,
    };
    voucherModel.voucherModel
      .findByIdAndUpdate({ _id: idVoucher }, voucher)
      .then(() => {
        res.redirect("/listvoucher");
      });
  });
  blobWriter.end(req.file.buffer);
};
exports.addVoucher = async (req, res, next) => {
  const id = req.session.user?._id;
  const nameFile = req.file.originalname;
  const blob = firebase.bucket.file(nameFile);
  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
  });

  blobWriter.on("finish", () => {
    const voucher = {
      ...req.body,
      money: Number.parseInt(req.body.voucherPrice),
      name: req.body.nameVoucher,
      hsd: String(req.body.voucherDate),
      restaurantId: id,
      quantity: Number.parseInt(req.body.quantity),
      limit: Number.parseInt(req.body.limit),

      image: `https://firebasestorage.googleapis.com/v0/b/datn-de212.appspot.com/o/${nameFile}?alt=media&token=d890e1e7-459c-4ea8-a233-001825f3c1ae`,
    };
    voucherModel.voucherModel.create(voucher).then(() => {
      res.redirect("/listvoucher");
    });
  });
  blobWriter.end(req.file.buffer);
};
