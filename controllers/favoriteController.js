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
      favorite.listFavorite = favorite.listFavorite.filter((p) => {
        if (p.productId.equals(productId)) {
          p.likeCount = Math.max(p.likeCount - 1, 0);
          return false; 
        }
        return true;
      });
      product.totalLikes = Math.max(totalLikes - 1, 0);
      product.likeCount = Math.max(product.likeCount - 1, 0); 
    } else {
      if (productIndex === -1) {
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
        product.totalLikes += 1;
        product.likeCount += 1; 
      } else {
        favorite.listFavorite[productIndex].isLiked = isLiked;
        favorite.listFavorite[productIndex].likeCount += 1;
        product.totalLikes += 1;
        product.likeCount += 1; 
      }
    }

    console.log('Sau khi cập nhật - product:', product);

    await favorite.populate('listFavorite.restaurantId');
    console.log('likeCount sau khi cập nhật:', product.likeCount); 

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
    const productsWithLikes = await Product.productModel.find({ totalLikes: { $gt: 0 } });
    res.status(200).json({ data: productsWithLikes, msg: 'Lấy dữ liệu thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Đã xảy ra lỗi' });
  }
};
