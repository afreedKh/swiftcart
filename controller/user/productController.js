const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");
const Category = require("../../models/categoryModel")
const User = require("../../models/userModel");
const mongoose = require('mongoose');
const Offer = require("../../models/offerModel");


  



const loadProductDetails = async (req, res) => {
  try {
    // Fetch the product from the database using the product ID
    const product = await Product.findById(req.params.id);
   
   
    const users = req.session.user||req.session.passport;
   
    let user;

    if (users) {
      user = await User.findById(users._id);
    }else {
      user = null;
    }

    let cartCount = 0;
    let wishlistCount = 0;
    let cart = null;

    if (user) {
     
      cart = await Cart.findOne({ userId: user._id });
      
      wishlistCount = user.wishlist ? user.wishlist.length : 0;
      cartCount = cart && cart.items ? cart.items.length : 0;
    }

   
    const activeOffers = await Offer.find({
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      isActive: true
    });

    let offer = null;
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

    
    product.varients.forEach(variant => {
      variant.images = variant.images.filter(image => image !== null);
    });

   
    res.render("productDetails", {
      product,
      user,
      cartCount,
      wishlistCount,
      breadcrumbs: [
        { name: "Home", url: '/' },
        { name: "Product Details", url: "#" }
      ]
    });

  } catch (error) {
    console.log('loadProductDetails error', error.message);
    res.status(404).redirect('/404')

  }
};








const loadProductList = async (req, res) => {
    try {
        const { sort = 'newness', page = 1, limit = 9, search = '', category } = req.query;









        
        const users = req.session.user||req.session.passport;
   
        let user;

        if (users) {
          user = await User.findById(users._id);
        }else {
          user = null;
        }

        let cartCount = 0;
        let wishlistCount = 0;
        let cart = null;

        if (user) {
        
          cart = await Cart.findOne({ userId: user._id });
          
          wishlistCount = user.wishlist ? user.wishlist.length : 0;
          cartCount = cart && cart.items ? cart.items.length : 0;
        }
        






        const sortOptions = {
            popularity: { popularity: -1 },
            priceLowHigh: { price: 1 },
            priceHighLow: { price: -1 },
            avgRating: { averageRating: -1 },
            newness: { createdAt: -1 },
            aToZ: { name: 1 },
            zToA: { name: -1 }
        };

       
        let filter = { isDeleted: false };
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (category) {
            filter.category = new mongoose.Types.ObjectId(category);
        }

        
        const totalProducts = await Product.countDocuments(filter);

      
        const products = await Product.aggregate([
            { $match: filter },
            { $sort: sortOptions[sort] || sortOptions.newness },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        ]);

        
        const categories = await Category.find({ isDeleted: false });

      
        const totalPages = Math.ceil(totalProducts / parseInt(limit));


        const activeOffers = await Offer.find({
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
            isActive: true
          });
      
        
          const productsWithOffers = products.map(product => {
            let offer = null;
      
           
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


        res.render("productList", {
            products: productsWithOffers,
            categories,
            currentSort: sort,
            currentSearch: search,
            currentCategory: category,
            currentPage: parseInt(page),
            totalPages,
            limit: parseInt(limit),
            cartCount,
            wishlistCount
        });

    } catch (error) {
        console.error('loadProductList error:', error);
        return res.status(404).redirect('/404')

    }
};





const filterProduct = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.query;
       
        
        const products = await Product.find({
            price: { $gte: minPrice, $lte: maxPrice }
        });

        res.json(products);
    } catch (error) {
        console.error('Error fetching filtered products:', error);
        return res.status(404).redirect('/404')

    }
}












module.exports={
    loadProductDetails,
    loadProductList,
    filterProduct
}