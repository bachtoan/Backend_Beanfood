var historyModel = require("../models/history");
const ProductModel = require("../models/product.model");
const mongoose = require("mongoose");
var userController = require("../models/users.model");
const moment = require("moment");

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
exports.getDonHangChiTiet = async (id) => {
  const data = await historyModel.History.findOne({ _id: id });
  const user = await userController.userModel.findOne({
    _id: new mongoose.Types.ObjectId(data?.userId),
  });
  const { username, phone } = user;
  const dataConcat = {
    product: data.products,
    _id: data?._id,
    username,
    phone,
    totalPrice: data.toltalprice,
  };
  return dataConcat;
};
exports.getChiTiet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    const chiTietDonHang = await historyModel.History.findOne({ _id: id })
      .populate({
        path: 'products.restaurantId',
        select: 'name',
        model: 'restaurantModel', 
      });

    if (!chiTietDonHang) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    res.json(chiTietDonHang);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
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
    await historyModel.History.deleteMany({});
    res.json({ msg: "Tất cả lịch sử mua hàng đã được xóa" });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

exports.getOrdersByRestaurant = async (req, res) => {
  try {
    const user = req.session.user;
    const restaurantId = user._id;
    const orders = await historyModel.History.find({
      "products.restaurantId": restaurantId,
    });
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Đã xảy ra lỗi" });
  }
};

exports.updateOrderStatusByRestaurant = async (req, res) => {
  const orderId = req.params.orderId;
  const newStatus = req.body.status;

  try {
    const updatedOrder = await historyModel.History.findByIdAndUpdate(
      orderId,
      { $set: { status: newStatus } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ msg: "Không tìm thấy đơn hàng" });
    }

    let statusMessage = "";
    switch (newStatus) {
      case 1:
        statusMessage = "Đã xác nhận";
        break;
      case 2:
        statusMessage = "Đơn hàng đang giao.";
        break;
      case 3:
        statusMessage = "Đơn hàng đã giao.";
      case 4:
        statusMessage = "Đơn hàng đã được hủy.";
        break;
      default:
        statusMessage = "Chờ xác nhận.";
    }

    res.json({ msg: statusMessage });
  } catch (error) {
    console.error("Error:", error);

    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({ msg: "ID đơn hàng không hợp lệ." });
    }

    res.status(500).json({ msg: "Đã xảy ra lỗi" });
  }
};

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
        { $set: { status: 4 } },
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

exports.getDoanhThuTheoDieuKien = async (req) => {
  try {
    const user = req.session.user;
    const restaurantId = user._id;
    const orders = await historyModel.History.find({
      "products.restaurantId": restaurantId,
      status: 3,
    });
    return orders;
  } catch (error) {
    console.error(error);
  }
};

exports.getOrders = async (req, res) => {
  var slug = req.params.slug;
  let value = 3;
  if (slug == "huy") {
    console.log("vao day");
    value = 4;
  } else {
    value = 3;
  }
  try {
    const user = req.session.user;
    const restaurantId = user._id;

    const soluongdahuy = await historyModel.History.countDocuments({
      status: 4,
      "products.restaurantId": restaurantId,
    });
    const soluongthanhcong = await historyModel.History.countDocuments({
      status: 3,
      "products.restaurantId": restaurantId,
    });

    const orders = await historyModel.History.find({
      "products.restaurantId": restaurantId,
      status: value,
    });
    console.log(orders);
    res.json({
      orders,
      soluongdahuy,
      soluongthanhcong,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Đã xảy ra lỗi" });
  }
};

exports.getTopRestaurants = async (req, res) => {
  try {
    const topRestaurants = await historyModel.History.aggregate([
      {
        $match: {
          "products.restaurantId": { $exists: true },
          status: 3,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $addFields: {
          "products.restaurantId": { $toObjectId: "$products.restaurantId" },
        },
      },
      {
        $group: {
          _id: "$products.restaurantId",
        },
      },
      {
        $lookup: {
          from: "restaurants", 
          localField: "_id",
          foreignField: "_id",
          as: "restaurantInfo",
        },
      },
      {
        $unwind: "$restaurantInfo",
      },
      {
        $project: {
          role: "$restaurantInfo.role",
          _id: "$_id",
          restaurantName: "$restaurantInfo.name",
          email: { $ifNull: ["$restaurantInfo.email", ""] },
          phone: { $ifNull: ["$restaurantInfo.phone", ""] },
          timeon: { $ifNull: ["$restaurantInfo.timeon", ""] },
          timeoff: { $ifNull: ["$restaurantInfo.timeoff", ""] },
          image: { $ifNull: ["$restaurantInfo.image", ""] },
          address: { $ifNull: ["$restaurantInfo.address", ""] },
          totalRevenue: 1,
        },
      },
      {
        $sort: { totalRevenue: -1 },
      },
      {
        $limit: 10,
      },
    ]);
    console.log("After Match:", topRestaurants);
    console.log("After Unwind:", topRestaurants);
    console.log("After Group:", topRestaurants);
    console.log("After Lookup:", topRestaurants);
    console.log("After Unwind:", topRestaurants);
    console.log("After Project:", topRestaurants);
    console.log("After Sort:", topRestaurants);
    console.log("Final Result:", topRestaurants);

    res.status(200).json({
      data: topRestaurants,
      msg: "Lấy dữ liệu top nhà hàng thành công",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Đã xảy ra lỗi" });
  }
};
