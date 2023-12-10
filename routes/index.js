var express = require("express");
const session = require("express-session");
const { yeu_cau_dang_nhap } = require("../middleware/checklogin");
var product = require("../controllers/product.controller");
var comment = require("../controllers/comment.controller");
const mongoose = require("mongoose");
var sanPhamDangDuyet = require("../controllers/sanPhamDangDuyet.controller");
var order = require("../controllers/orderControllers");
const history = require("../controllers/historyOrderController");
var router = express.Router();

/* GET home page. */
router.get("/", yeu_cau_dang_nhap);
router.get("/addProduct", function (req, res, next) {
  res.render("product/addProduct", { title: "Express", req: req });
});
router.get("/showProduct", async function (req, res, next) {
  const data = await product.dataProductRestaurant(req, res);
  res.render("product/showProduct", {
    list: data,
    req: req,
  });
});
router.get("/editProduct/:id", async function (req, res, next) {
  const data = await product.editProduct(req, res);
  res.render("product/editProduct", {
    title: "Express",
    req: req,
    product: data,
  });
});
router.get("/donhang/:id", async function (req, res, next) {
  const data = await history.getDonHangChiTiet(req.params.id);
  console.log(data);
  res.render("singlemenu/chitietdonhang", {
    title: "Express",
    data: data,
    req: req,
  });

  // res.render("singlemenu/chitietdonhang", {
  //   title: "Express",
  //   data: data,
  //   req: req,
  // });
});
router.get("/home", function (req, res, next) {
  res.render("home", { title: "Express" });
});

router.get("/feedback", async function (req, res) {
  const data = await product.dataProductRestaurant(req, res);

  const getAllComment = await comment.getAllComment(req, res);
  const info = [];
  data.map((dt, index) => {
    const dataFilter = {};
    const objectId1 = new mongoose.Types.ObjectId(dt?._id);
    dataFilter.name = dt.name;
    dataFilter.image = dt.image;
    dataFilter.listComment = [];
    getAllComment.map((cm, index) => {
      const objectId2 = new mongoose.Types.ObjectId(cm?.idProduct?._id);
      if (objectId1.equals(objectId2)) {
        dataFilter.listComment.push({
          username: cm.idUser?.username,
          avatar: cm.idUser?.avatar,
          title: cm.title,
        });
      }
    });
    info.push(dataFilter);
  });
  console.log("bang comment", info);

  res.render("feedback/feedback", { req: req, data: info });
});

router.get("/revenue", function (req, res, next) {
  res.render("revenue/showrevenue", { title: "Express", req: req });
});
router.get("/singlemenu", function (req, res, next) {
  res.render("singlemenu/statistics", { title: "Express", req: req });
});
router.get("/duyetDon", function (req, res, next) {
  res.render("singlemenu/duyetDon", { title: "Express", req: req });
});
router.get("/MyProfile", function (req, res, next) {
  res.render("profile/profile", { title: "Express", req: req });
});
router.get("/Favorite", function (req, res, next) {
  res.render("favorite/favorites", { title: "Express", req: req });
});
router.get("/listproduct", product.getListProduct);
router.get("/adminRevenue", product.getRevenue);
router.get("/showrevenue", history.getRevenueRestaurant);
router.get("/orderstatistics", order.getOrdersWeb);
router.get("/censorship", sanPhamDangDuyet.getListProduct);
router.get("/censorship/duyet/:id", sanPhamDangDuyet.duyet);
module.exports = router;
