
const Favorite = require('../models/favorite');
const Product = require('../models/product.model'); // Import model sản phẩm
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.body.userId;
    const productId = req.body.productId;
    const isLiked = req.body.isLiked;

    const product = await Product.productModel
      .findById(productId, 'name image realPrice description likeCount')
      .populate('restaurantId');

    if (!product) {
      return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
    }

    console.log('Trước khi cập nhật - product:', product);

    let favorite = await Favorite.favoriteModel.findOne({ userId });

    if (!favorite) {
      favorite = new Favorite.favoriteModel({ userId });
    }

    const { name, image, realPrice, description, restaurantId, totalLikes } = product;

    const productIndex = favorite.listFavorite.findIndex((p) => p.productId.equals(productId));

    if (!isLiked) {
      // Hủy thích sản phẩm
      favorite.listFavorite = favorite.listFavorite.filter((p) => {
        if (p.productId.equals(productId)) {
          // Giảm số lượng tim khi hủy thích
          p.likeCount = Math.max(p.likeCount - 1, 0);
          return false; // Loại bỏ sản phẩm khỏi danh sách yêu thích
        }
        return true;
      });
      // Giảm tổng số lượng tim của sản phẩm
      product.totalLikes = Math.max(totalLikes - 1, 0);
      product.likeCount = Math.max(product.likeCount - 1, 0); // Cập nhật likeCount ở đây
    } else {
      if (productIndex === -1) {
        // Nếu sản phẩm chưa được thêm vào danh sách yêu thích
        favorite.listFavorite.push({
          productId,
          name,
          image,
          realPrice,
          description,
          restaurantId,
          isLiked,
          likeCount: 1,
        });
        // Tăng tổng số lượng tim của sản phẩm
        product.totalLikes += 1;
        product.likeCount += 1; // Cập nhật likeCount ở đây
      } else {
        // Nếu sản phẩm đã có trong danh sách yêu thích
        favorite.listFavorite[productIndex].isLiked = isLiked;
        // Tăng số lượng tim khi thích
        favorite.listFavorite[productIndex].likeCount += 1;
        // Tăng tổng số lượng tim của sản phẩm
        product.totalLikes += 1;
        product.likeCount += 1; // Cập nhật likeCount ở đây
      }
    }

    console.log('Sau khi cập nhật - product:', product);

    // Sử dụng populate để lấy thông tin nhà hàng
    await favorite.populate('listFavorite.restaurantId');
    console.log('likeCount sau khi cập nhật:', product.likeCount); // Log giá trị likeCount để kiểm tra

    await favorite.save();
    await product.save();

    return res.status(200).json({ data: favorite, msg: 'Lấy dữ liệu thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Đã xảy ra lỗi' });
  }
};


exports.getAllFavorite = async (req, res) => {
  try {
      const favorites = await Favorite.favoriteModel.find().populate('listFavorite.restaurantId');
      res.status(200).json(favorites);
  } catch (error) {
      return res.status(500).json({ msg: error.message });
  }
};

exports.getListProductFavoritebyUid = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const listproducts = await Favorite.favoriteModel.find({ userId: userId }).populate('listFavorite.restaurantId');

    if (!listproducts || listproducts.length === 0) {
      return res.status(404).json({ msg: 'Không tìm thấy sản phẩm yêu thích'  });
    }

    res.status(200).json( listproducts);
  } catch (error) {
    console.error('Lỗi khi lấy sản phẩm yêu thích:', error);
    res.status(500).json({ msg: 'Lỗi máy chủ nội bộ.' });
  }
};

exports.getLikes = async (req, res) => {
  try {
    // Lấy danh sách sản phẩm có số lượng like lớn hơn 0
    const productsWithLikes = await Product.productModel.find({ totalLikes: { $gt: 0 } });

    // Trả về danh sách sản phẩm và số lượng like
    res.status(200).json({ data: productsWithLikes, msg: 'Lấy dữ liệu thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Đã xảy ra lỗi' });
  }
};