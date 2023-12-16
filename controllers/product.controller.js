var productModel = require("../models/product.model");
var restaurantModel = require("../models/restaurant.model");
const { History } = require("../models/history.js");
const firebase = require("../firebase/index.js");
process.env.TZ = "Asia/Ho_Chi_Minh";
const moment = require("moment-timezone");
const { error } = require("firebase-functions/logger");
const evaluteModel = require("../models/evaluate.js");

exports.getSuggest = async (req, res, next) => {
  try {
    const list = await productModel.productModel
      .find({ isHide: false })
      .populate("restaurantId");
    const data = list.map((product) => {
      const restaurantName = product.restaurantId.name;
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
// lấy theo danh mục
exports.getProductDanhMuc = async (req, res, next) => {
  try {
    const nameDanhMuc = req.params.category;
    const products = await productModel.productModel
      .find({
        category: nameDanhMuc,
        isHide: false,
      })
      .populate("restaurantId");
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(204).json({ msg: error.message });
  }
};
exports.ngungKinhDoanhProduct = async (req, res, next) => {
  const id = req.params.id;
  const sp = await productModel.productModel.findById({ _id: id });
  try {
    const product = await productModel.productModel.findByIdAndUpdate(
      {
        _id: id,
      },
      { isHide: !sp.isHide }
    );

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
    if (list) {
      list.sort((a, b) => {
        if (a.isHide && !b.isHide) return 1;
        if (!a.isHide && b.isHide) return -1;
        return 0;
      });
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
    const list = await productModel.productModel
      .find({ restaurantId, isHide: false })
      .populate("restaurantId");
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
    const products = await productModel.productModel
      .find({
        name: { $regex: productName, $options: "i" },
        isHide: false,
      })
      .populate("restaurantId");

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
      description: String(req.body.description),
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
      description: String(req.body.description),
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
    const listrestaurant = await restaurantModel.restaurantModel.find();

    let productsQuery = { isHide: false };

    if (
      req.query.categoryFilter &&
      req.query.categoryFilter.trim().toLowerCase() !== "tatca"
    ) {
      productsQuery.category = req.query.categoryFilter.trim();
    }

    if (
      req.query.restaurantFilter &&
      req.query.restaurantFilter.trim().toLowerCase() !== "tatca"
    ) {
      productsQuery.restaurantId = req.query.restaurantFilter.trim();
    }

    const itemsPerPage = 5;
    const page = parseInt(req.query.page) || 1;

    const totalCount = await productModel.productModel.countDocuments(
      productsQuery
    );
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const skip = (page - 1) * itemsPerPage;

    const products = await productModel.productModel
      .find(productsQuery)
      .skip(skip)
      .limit(itemsPerPage);

    const restaurantIds = products.map((product) => product.restaurantId);

    const restaurants = await restaurantModel.restaurantModel.find({
      _id: { $in: restaurantIds },
    });

    const restaurantMap = new Map();
    restaurants.forEach((restaurant) => {
      restaurantMap.set(restaurant._id.toString(), restaurant.name);
    });

    const productsWithRestaurantName = products.map((product) => {
      return {
        ...product.toObject(),
        restaurantName: restaurantMap.get(product.restaurantId.toString()),
      };
    });

    const pagination = {
      currentPage: page,
      totalItems: totalCount,
      itemsPerPage: itemsPerPage,
      totalPages: totalPages,
      baseUrl: "/listproduct",
    };

    res.render("product/listProduct", {
      list: productsWithRestaurantName,
      listRestaurant: listrestaurant,
      pagination: pagination,
      req: req,
    });
  } catch (error) {
    return res.status(204).json({ msg: error.message });
  }
};

exports.postEvaluate = async (req, res, next) => {
  try {
    const star = Number(req.body.star);
    let evaluateRecord = await evaluteModel.evaluteModel.findById(
      req.body.productId
    );

    if (evaluateRecord) {
      evaluateRecord.totalStar += star;
      evaluateRecord.totalEvaluate += 1;
      evaluateRecord.average =
        evaluateRecord.totalStar / evaluateRecord.totalEvaluate;
      await evaluateRecord.save();
      return res
        .json({
          msg: "Đánh giá đã được cập nhật thành công",
          data: evaluateRecord,
        })
        .status(200);
    } else {
      evaluateRecord = new evaluteModel.evaluteModel({
        _id: productId,
        totalEvaluate: 1,
        totalStar: star,
        average: star,
        productId,
      });
      await evaluateRecord.save();

      return res
        .json({
          msg: "Đánh giá đã được thêm thành công",
          data: evaluateRecord,
        })
        .status(200);
    }
  } catch (error) {
    console.error("Lỗi khi xử lý đánh giá:", error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi xử lý đánh giá" });
  }
};
// lấy theo danh mục
exports.getProductDanhMuc = async (req, res, next) => {
  try {
    const nameDanhMuc = req.params.category;
    const products = await productModel.productModel.find({
      category: nameDanhMuc,
      isHide: false,
    });
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(204).json({ msg: error.message });
  }
};

exports.getRevenue = async (req, res, next) => {
  const currentDate = moment().startOf("day");
  const startOfToday = currentDate.toISOString();
  const startOfThisMonth = moment().startOf("month").toISOString();
  const startOfThisYear = moment().startOf("year").toISOString();

  try {
    // Lấy các hóa đơn trong ngày có status = 4
    const billsToday = await History.find({
      time: { $gte: startOfToday },
      status: 3,
    });
    const dataForChartToday = organizeDataByHour(billsToday);

    // Lấy các hóa đơn trong tháng có status = 4
    const billsThisMonth = await History.find({
      time: { $gte: startOfThisMonth },
      status: 3,
    });
    const dataForChartMonth = organizeDataByMonth(billsThisMonth);

    // Lấy các hóa đơn trong năm có status = 4
    const billsThisYear = await History.find({
      time: { $gte: startOfThisYear },
      status: 3,
    });

    // Tạo mảng userIds từ các hóa đơn
    const userIdsToday = Array.from(
      new Set(billsToday.map((bill) => bill.userId))
    );
    const userIdsThisMonth = Array.from(
      new Set(billsThisMonth.map((bill) => bill.userId))
    );
    const userIdsThisYear = Array.from(
      new Set(billsThisYear.map((bill) => bill.userId))
    );

    // Lấy tổng totalprice từ các hóa đơn
    const totalRevenueToday = billsToday.reduce(
      (total, bill) =>
        isNaN(bill.toltalprice) ? total : total + bill.toltalprice,
      0
    );

    const totalRevenueThisMonth = billsThisMonth.reduce(
      (total, bill) =>
        isNaN(bill.toltalprice) ? total : total + bill.toltalprice,
      0
    );

    const totalRevenueThisYear = billsThisYear.reduce(
      (total, bill) =>
        isNaN(bill.toltalprice) ? total : total + bill.toltalprice,
      0
    );
    console.log("sss", dataForChartToday.revenue);
    res.render("revenue/adminRevenue", {
      req: req,
      bills: billsToday,
      billsThisMonth: billsThisMonth,
      billsThisYear: billsThisYear,
      userIdsToday: userIdsToday,
      userIdsThisMonth: userIdsThisMonth,
      userIdsThisYear: userIdsThisYear,
      totalRevenueToday: totalRevenueToday,
      totalRevenueThisMonth: totalRevenueThisMonth,
      totalRevenueThisYear: totalRevenueThisYear,

      categoriesToday: dataForChartToday.categories,
      dataToday: dataForChartToday.data,
      revenueToday: dataForChartToday.revenue,

      categoriesMonth: dataForChartMonth.categories,
      dataMonth: dataForChartMonth.data,
      revenueMonth: dataForChartMonth.revenue,
    });
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ bảng Bill:", error);
    res.status(500).send("Đã xảy ra lỗi khi lấy dữ liệu từ bảng Bill");
  }
};

function organizeDataByHour(bills) {
  const roundedTimes = bills.map((bill) => {
    const time = new Date(bill.time);
    const roundedTime = new Date(
      time.getFullYear(),
      time.getMonth(),
      time.getDate(),
      Math.floor(time.getHours() / 2) * 2
    );
    const revenue = parseFloat(bill.toltalprice) || 0; // Chuyển đổi thành số và mặc định là 0 nếu không phải số
    return { time: roundedTime, revenue, count: 1 };
  });

  roundedTimes.sort((a, b) => a.time - b.time);

  const data = [];

  roundedTimes.forEach((roundedTime) => {
    const hourKey = roundedTime.time.toISOString();
    const existingData = data.find((item) => item.time === hourKey);

    if (existingData) {
      existingData.count += roundedTime.count;
      existingData.revenue += roundedTime.revenue;
    } else {
      data.push({
        time: hourKey,
        count: roundedTime.count,
        revenue: roundedTime.revenue,
      });
    }
  });

  data.sort((a, b) => new Date(a.time) - new Date(b.time));
  const valuesForChart = data.map((item) => item.count);

  return {
    categories: data.map((item) => item.time),
    data: valuesForChart,
    revenue: data.map((item) => item.revenue),
  };
}

function organizeDataByMonth(bills) {
  // Lấy ra các ngày (không bao gồm giờ) duy nhất từ danh sách hóa đơn
  const uniqueDays = [
    ...new Set(
      bills.map((bill) =>
        new Date(bill.time).toISOString().split("T")[0].trim()
      )
    ),
  ];

  // Sắp xếp ngày tăng dần
  const categories = uniqueDays.sort();

  // Tính số lượng hóa đơn cho mỗi ngày
  const data = categories.map(
    (day) =>
      bills.filter((bill) => {
        const billDate = new Date(bill.time).toISOString().split("T")[0].trim();
        return billDate === day;
      }).length
  );

  // Tính tổng doanh thu cho mỗi ngày
  const revenue = categories.map((day) =>
    bills
      .filter(
        (bill) => new Date(bill.time).toISOString().split("T")[0].trim() === day
      )
      .reduce((total, bill) => total + bill.toltalprice, 0)
  );
  return { categories, data, revenue };
}
