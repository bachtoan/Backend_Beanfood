var historyModel = require('../models/history');
const ProductModel = require('../models/product.model');
const mongoose = require('mongoose');


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
exports.getHistory = async (req, res) => {
    try {
        const history = await historyModel.History.find();
        res.status(200).json(history);
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};

exports.getUserHistory = async (req, res) => {
    console.log('fdscbg', req.body);
    try {
        const userId = req.params.userId;
        if (!userId || userId.length !== 24) {
            return res.status(400).json({ msg: 'ID người dùng không hợp lệ' });
        }
        //
        const userHistory = await historyModel.History.find({ userId });

        if (!userHistory || userHistory.length === 0) {
            return res.status(404).json({ msg: 'Không tìm thấy lịch sử mua hàng cho người dùng này' });
        }
        res.json(userHistory);
    } catch (error) {
        console.error('Lỗi khi truy vấn lịch sử mua hàng:', error);
        return res.status(500).json({ msg: 'Lỗi máy chủ nội bộ' });
    }
};

exports.deleteHistory = async (req, res) => {
    const orderId = req.params.orderId;
    try {
        const deleted = await History.findOneAndDelete({ orderId });
        if (!deleted) {
            return res.status(404).json({ msg: 'Không tìm thấy lịch sử mua hàng' });
        }
        res.json(deleted)
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
};
exports.deleteHistoryAll = async (req, res) => {
    try {
        // Xóa tất cả các bản ghi trong mô hình History
        await historyModel.History.deleteMany({});

        res.json({ msg: 'Tất cả lịch sử mua hàng đã được xóa' });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
}

// cập nhật trạng thái đơn hàng
exports.getOrdersByRestaurant = async (req, res) => {
    try {
        const user = req.session.user;
        const restaurantId = user._id;
        const orders = await historyModel.History.find({
            'products.restaurantId': restaurantId,
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Đã xảy ra lỗi' });
    }
};

exports.updateOrderStatusByRestaurant = async (req, res) => {
    const orderId = req.params.orderId;
    const newStatus = req.body.status;

    try {
        // if (![0, 1, 2, 3].includes(newStatus)) {
        //     return res.status(400).json({ msg: 'Trạng thái không hợp lệ.' });
        // }

        const updatedOrder = await historyModel.History.findByIdAndUpdate(
            orderId,
            { $set: { status: newStatus } },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });
        }

        let statusMessage = '';
        switch (newStatus) {
            case 1:
                statusMessage = 'Đã xác nhận';
                break;
            case 2:
                statusMessage = 'Đơn hàng đang giao.';
                break;
            case 3:
                statusMessage = 'Đơn hàng đã giao.'
            case 4:
                statusMessage = 'Đơn hàng đã được hủy.';
                break;
            default:
                statusMessage = 'Chờ xác nhận.';
        }

        res.json({ msg: statusMessage });
    } catch (error) {
        console.error('Error:', error);

        // Bắt lỗi cụ thể và trả về mã lỗi và thông điệp
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'ID đơn hàng không hợp lệ.' });
        }

        res.status(500).json({ msg: 'Đã xảy ra lỗi' });
    }
};

// hủy đơn hàng cho user khi còn ở trạng thái đang chờ duyệt 
exports.cancelOrder = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const userIdFromRequest = req.body.userId;
        const order = await historyModel.History.findById(orderId);
        if (!order) {
            return res.status(404).json({ msg: 'Không tìm thấy đơn hàng' });
        }
        if (order.userId !== userIdFromRequest) {
            return res.status(403).json({ msg: 'Bạn không có quyền hủy đơn hàng này.' });
        }
        if (order.status === 0) {
            const updatedOrder = await historyModel.History.findByIdAndUpdate(
                orderId,
                { $set: { status: 4 } },
                { new: true }
            );
            return res.json({ msg: 'Đơn hàng đã được hủy.' });
        } else {
            return res.status(400).json({ msg: 'Không thể hủy đơn hàng ở trạng thái khác 0.' });
        }
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

exports.getRevenue = async (req, res) => {
    try {
        const user = req.session.user;
        console.log('user', user);
        if (!user) {
            return res.status(401).json({ msg: 'Nhà hàng chưa đăng nhập' });
        }
        const restaurantId = user._id;
        console.log('restaurantId', restaurantId);

        // Bắt đầu pipeline
        const orders = await historyModel.History.find({
            'products.restaurantId': restaurantId,
            status: 3,
        });

        console.log('Orders:', orders);

        if (orders.length === 0) {
            return res.status(404).json({ msg: 'Không có đơn hàng' });
        }

        let totalRevenue = 0;

        for (const order of orders) {
            for (const product of order.products) {
                const productInfo = await ProductModel.productModel.findById(product.productId);

                if (productInfo) {
                    // Tính toán doanh thu dựa trên thông tin chi tiết của sản phẩm
                    const revenueFromProduct = product.quantity * productInfo.realPrice;
                    totalRevenue += revenueFromProduct;
                }
            }
        }

        console.log('Total Revenue:', totalRevenue);

        // Trả kết quả cho client hoặc thực hiện các bước tiếp theo của pipeline
        res.status(200).json({ totalRevenue });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Đã xảy ra lỗi' });
    }
};
exports.getOrders = async (req, res) => {
    try {
        const user = req.session.user;
        const restaurantId = user._id;
        const orders = await historyModel.History.find({
            'products.restaurantId': restaurantId,
            status: 3,
        });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Đã xảy ra lỗi' });
    }
};

// Hàm lấy danh sách top nhà hàng theo doanh thu
exports.getTopRestaurants = async (req, res) => {
    try {
        const topRestaurants = await historyModel.History.aggregate([
            {
                $match: {
                    'products.restaurantId': { $exists: true },
                    status: 3,
                },
            },
            {
                $unwind: '$products',
            },
            { $addFields: { 'products.restaurantId': { $toObjectId: '$products.restaurantId' } } }, // Convert restaurantId to ObjectId
            {
                $group: {
                    _id: '$products.restaurantId',
                    // totalRevenue: { $sum: { $multiply: ['$products.quantity', '$products.price'] } },
                },
            },
            {
                $lookup: {
                    from: 'restaurants', // Tên collection nhà hàng
                    localField: '_id',
                    foreignField: '_id',
                    as: 'restaurantInfo',
                },
            },
            {
                $unwind: '$restaurantInfo',
            },
            {
                $project: {
                    role: '$restaurantInfo.role',
                    restaurantId: '$_id',
                    restaurantName: '$restaurantInfo.name',
                    email: { $ifNull: ['$restaurantInfo.email', '']},
                    phone: {$ifNull: ['$restaurantInfo.phone', '']},
                    timeon: { $ifNull: ['$restaurantInfo.timeon', ''] },
                    timeoff: { $ifNull: ['$restaurantInfo.timeoff', ''] }, 
                    image: { $ifNull: ['$restaurantInfo.image', ''] },
                    address: {$ifNull: ['$restaurantInfo.address', '']},
                    totalRevenue: 1,
                    _id: 0,
                },
            },
            {
                $sort: { totalRevenue: -1 },
            },
            {
                $limit: 10, // Chọn số lượng top nhà hàng bạn muốn hiển thị
            },
        ]);

        // Log giá trị sau mỗi bước
        console.log('After Match:', topRestaurants);
        console.log('After Unwind:', topRestaurants);
        console.log('After Group:', topRestaurants);
        console.log('After Lookup:', topRestaurants);
        console.log('After Unwind:', topRestaurants);
        console.log('After Project:', topRestaurants);
        console.log('After Sort:', topRestaurants);
        console.log('Final Result:', topRestaurants);

        res.status(200).json({ data: topRestaurants, msg: "Lấy dữ liệu top nhà hàng thành công" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Đã xảy ra lỗi' });
    }
};