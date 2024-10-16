const Product = require("../../models/productModel");
const Banner = require("../../models/bannerModel");
const Category = require("../../models/categoryModel");
const Offer = require("../../models/offerModel");

const loadLandingpage = async (req, res) => {
    try {
      const logout = req.query.logout || null;
  
      // Fetch products, banners, and categories
      const products = await Product.aggregate([
        { $match: { isDeleted: false } },
        { $sort: { createdAt: -1 } },
        { $limit: 14 }
      ]);
      
      const banners = await Banner.aggregate([{ $match: { isDeleted: false } }]);
      const categories = await Category.aggregate([{ $match: { isDeleted: false } }]);
  
      // Fetch active offers
      const activeOffers = await Offer.find({
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
        isActive: true
      });
  
      // Apply the offer logic to each product
      const productsWithOffers = products.map(product => {
        let offer = null;
  
        // Check if an offer is applicable to this product or its category
        activeOffers.forEach(o => {
          if (o.type === 'product' && o.applicableId.includes(product._id)) {
            offer = o;
          } else if (o.type === 'category' && o.applicableId.includes(product.category)) {
            offer = o;
          }
        });
  
        if (offer) {
          product.discount = offer.discount;
          product.discountedPrice = product.price * (1 - offer.discount / 100);
        } else {
          product.discount = null;
          product.discountedPrice = product.price;
        }
  
        return product;
      });
  
      const wishlistCount = 0;
      res.render("home", { banners, categories, logout, product: productsWithOffers, wishlistCount });
    } catch (error) {
      console.log("LoadHome page error ", error.message);
      return res.status(404).redirect('/404')

    }
  };

module.exports={
    loadLandingpage
}