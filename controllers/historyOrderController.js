var historyModel = require("../models/history");
const ProductModel = require("../models/product.model");
const mongoose = require("mongoose");

exports.createOrderSuccess = async (req, res, next) => {
  console.log("data", req.body);
  try {
    const OrderSuccess = new historyModel.History(req.body);
    let new_OrderSuccess = await OrderSuccess.save();
    return res.status(200).json({ OrderSuccess: new_OrderSuccess });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: error.message });
  }
};
exports.duyetDonHang = async (req, res, next) => {
  const id = req.session.user?._id;

  const listDonHangDonHang = await new historyModel.History.find({
    _id: id,
    status: 0,
  });
  console.log(listDonHangDonHang);
};
exports.getHistory = async (req, res) => {
  try {
    const history = await historyModel.History.find();
    res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.getUserHistory = async (req, res) => {
  console.log("fdscbg", req.body);
  try {
    const userId = req.params.userId;
    if (!userId || userId.length !== 24) {
      return res.status(400).json({ msg: "ID người dùng không hợp lệ" });
    }
    //
    const userHistory = await historyModel.History.find({ userId });

    if (!userHistory || userHistory.length === 0) {
      return res
        .status(404)
        .json({ msg: "Không tìm thấy lịch sử mua hàng cho người dùng này" });
    }
    res.json(userHistory);
  } catch (error) {
    console.error("Lỗi khi truy vấn lịch sử mua hàng:", error);
    return res.status(500).json({ msg: "Lỗi máy chủ nội bộ" });
  }
};

exports.deleteHistory = async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const deleted = await History.findOneAndDelete({ orderId });
    if (!deleted) {
      return res.status(404).json({ msg: "Không tìm thấy lịch sử mua hàng" });
    }
    res.json(deleted);
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};
exports.deleteHistoryAll = async (req, res) => {
  try {
    // Xóa tất cả các bản ghi trong mô hình History
    await historyModel.History.deleteMany({});

    res.json({ msg: "Tất cả lịch sử mua hàng đã được xóa" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// cập nhật trạng thái đơn hàng
exports.updateOrderStatusByRestaurant = async (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = req.body.status;

  try {
    if (![0, 1, 2, 3].includes(newStatus)) {
      return res.status(400).json({ msg: "Trạng thái không hợp lệ." });
    }
    const updatedOrder = await historyModel.History.findByIdAndUpdate(
      orderId,
      { $set: { status: newStatus } },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ msg: "Không tìm thấy đơn hàng" });
    }
    switch (newStatus) {
      case 1:
        return res.json({ msg: "Đơn hàng đang chuẩn bị." });
      case 2:
        return res.json({ msg: "Đơn hàng đã giao." });
      case 3:
        return res.json({ msg: "Đơn hàng đã được hủy." });
      default:
        return res.json({ msg: "Chờ xác nhận." });
    }
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

// hủy đơn hàng cho user khi còn ở trạng thái đang chờ duyệt
exports.cancelOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const userIdFromRequest = req.body.userId;
    const order = await historyModel.History.findById(orderId);
    if (!order) {
      return res.status(404).json({ msg: "Không tìm thấy đơn hàng" });
    }
    if (order.userId !== userIdFromRequest) {
      return res
        .status(403)
        .json({ msg: "Bạn không có quyền hủy đơn hàng này." });
    }
    if (order.status === 0) {
      const updatedOrder = await historyModel.History.findByIdAndUpdate(
        orderId,
        { $set: { status: 3 } },
        { new: true }
      );
      return res.json({ msg: "Đơn hàng đã được hủy." });
    } else {
      return res
        .status(400)
        .json({ msg: "Không thể hủy đơn hàng ở trạng thái khác 0." });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const user = req.session.user;
    console.log("user", user);
    if (!user) {
      return res.status(401).json({ msg: "Nhà hàng chưa đăng nhập" });
    }
    const restaurantId = user._id;
    console.log("restaurantId", restaurantId);

    // Bắt đầu pipeline
    const orders = await historyModel.History.find({
      "products.restaurantId": restaurantId,
      status: 2,
    });

    console.log("Orders:", orders);

    if (orders.length === 0) {
      return res.status(404).json({ msg: "Không có đơn hàng" });
    }

    let totalRevenue = 0;

    for (const order of orders) {
      for (const product of order.products) {
        const productInfo = await ProductModel.productModel.findById(
          product.productId
        );

        if (productInfo) {
          // Tính toán doanh thu dựa trên thông tin chi tiết của sản phẩm
          const revenueFromProduct = product.quantity * productInfo.realPrice;
          totalRevenue += revenueFromProduct;
        }
      }
    }

    console.log("Total Revenue:", totalRevenue);

    // Trả kết quả cho client hoặc thực hiện các bước tiếp theo của pipeline
    res.status(200).json({ totalRevenue });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Đã xảy ra lỗi" });
  }
};
