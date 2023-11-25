var express = require("express");
const router = express.Router();
const multer = require("multer");
var apiU = require("../controllers/user.controllers");
var apiOder = require("../controllers/orderControllers");
var apiHistory = require("../controllers/historyOrderController");
var apiSlider = require("../controllers/slider.controller");
var apiComment = require("../controllers/comment.controller");
var apiRestaurant = require("../controllers/restautant.controller");
var apiProduct = require("../controllers/product.controller");
var apiSanPhamDangDuyet = require("../controllers/sanPhamDangDuyet.controller");

const upload = multer({ storage: multer.memoryStorage() });

//user
router.get("/users", apiU.listUser);
router.get("/users/info/:id", apiU.infoUser);
router.post("/users/register", apiU.register);
router.post("/users/login", apiU.login);
router.post("/users/update/:id", apiU.update);

// đơn hàng
router.get("/order", apiOder.getOrders);
router.post("/add/order", apiOder.createOrder);
router.delete("/deleteorder/:id", apiOder.deleteOrder);
router.put("/updateorder/:id", apiOder.updateOrder);
router.delete("/deletebyUid/:id", apiOder.deletebyUid);
router.get("/order/:userId", apiOder.getOrdersByUser);

// lịch sủ mua hàng
router.post("/history/create", apiHistory.createOrderSuccess);
router.get("/history", apiHistory.getHistory);
router.get("/ordersByUser/:userId", apiHistory.getUserHistory);
router.delete("/history/delete", apiHistory.deleteHistory);
router.delete("/history/deleteAll", apiHistory.deleteHistoryAll);
router.put(
  "/update-order-status/:orderId",
  apiHistory.updateOrderStatusByRestaurant
);
router.put("/user/cancel", apiHistory.cancelOrder);
router.get("/revenue", apiHistory.getRevenue);
//slider
router.get("/slider/getAll", apiSlider.getSliders);
//comment
router.get("/comment/getAll", apiComment.getComment);
router.post("/comment/create", apiComment.postComment);

//restaurant
router.get("/restaurant/getAll", apiRestaurant.getRestaurants);
router.post("/restaurant/create", apiRestaurant.createRestaurant);
router.get("/restaurant/:id", apiRestaurant.getInfoRestaurantById);

router.post("/restaurant/delete/:id", apiRestaurant.deleteRestaurant);
//products
router.post("/product/delete/:id", apiProduct.deleteProduct);
router.get("/product/id/:id", apiProduct.getProduct);
router.get("/product/suggest", apiProduct.getSuggest);
router.post("/product/getbyname", apiProduct.getProductByName);

router.get(
  "/product/getProductsInRestaurant/:id",
  apiProduct.getProductInRestaurant
);
router.post(
  "/product/editProduct/:id",
  upload.single("image"),
  apiProduct.editDataProduct
);

router.post(
  "/product/addProduct",
  upload.single("image"),
  apiSanPhamDangDuyet.addProduct
);

module.exports = router;
