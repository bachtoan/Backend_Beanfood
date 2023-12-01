
const Favorite = require('../models/favorite');
const Product = require('../models/product.model'); // Import model sản phẩm

exports.toggleLike = async (req, res) => {
    try {
      const userId = req.body.userId;
      const productId = req.body.productId;
      const isLiked = req.body.isLiked;
  
      // Lấy thông tin sản phẩm từ cơ sở dữ liệu hoặc nơi bạn lưu trữ sản phẩm
      const product = await Product.productModel.findById(productId);
  
      if (!product) {
        return res.status(404).json({ msg: 'Sản phẩm không tồn tại' });
      }
  
      const restaurantId = product.restaurantId; // Lấy restaurantId từ sản phẩm
  
      let favorite = await Favorite.favoriteModel.findOne({ userId });
  
      if (!favorite) {
        favorite = new Favorite.favoriteModel({ userId });
      }
  
      if (isLiked === false) {
        favorite.listFavorite = favorite.listFavorite.filter((p) => p.productId !== productId);
      } else {
        const productIndex = favorite.listFavorite.findIndex(
          (p) => p.productId === productId
        );
        if (productIndex === -1) {
          favorite.listFavorite.push({ productId, restaurantId, isLiked });
        } else {
          favorite.listFavorite[productIndex].isLiked = isLiked;
        }
      }
  
      await favorite.save();
  
      res.status(200).json({ msg: 'Cập nhật danh sách yêu thích thành công' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Đã xảy ra lỗi' });
    }
  };