const Category = require("../../models/categoryModel");
const Banner = require("../../models/bannerModel");
const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");
const User = require("../../models/userModel")
const Offer = require("../../models/offerModel")




const loadUserHome = async(req, res) => {
  try {
      if (req.session.user || req.session.passport) {
          let users = req.session.user||req.session.passport;

          const user = await User.findById(users._id)
          const categories = await Category.aggregate([{$match: {isDeleted: false}}]);
          const banners = await Banner.aggregate([{$match: {isDeleted: false}}]);
          const product = await Product.aggregate([{$match:{isDeleted:false}},{$sort:{createdAt:-1}},{$limit:14}])
          
          
          let cart
          if(user){
               cart = await Cart.findOne({userId:user._id})
          }
          
          
          let name;
          if (user) {
              name = "Hello " + user.name;
          } 
          let cartCount;
          let wishlistCount
          if(users){
              wishlistCount=user.wishlist.length;
          }
          
          if(cart&&cart.items){
               cartCount  = cart.items.length
          }else{
              cartCount=0;
          }

          const activeOffers = await Offer.find({
              startDate: { $lte: new Date() },
              endDate: { $gte: new Date() },
              isActive: true
            });
        
            // Apply the offer logic to each product
            const productsWithOffers = product.map(product => {
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


        

          res.render("home", {
              name: name,
              user:user,
              banners: banners,
              categories: categories,
              isLoggedIn: true,
              product:productsWithOffers,
              cartCount,
              wishlistCount
          });
      } else {
          res.redirect("/");
      }
  } catch (error) {
      console.log("load user home page error", error.message);
      return res.status(404).redirect('/404')

  }
};



module.exports={
    loadUserHome
}