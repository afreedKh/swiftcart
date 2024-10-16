const User = require('../../models/userModel');
const Cart = require("../../models/cartModel")

const loadWallet = async (req, res) => {
  try {
      const users = req.session.user||req.session.passport;
      
   
      let userss;

      if (users) {
      userss = await User.findById(users._id);
      }else {
      userss = null;
      }

      let cartCount = 0;
      let wishlistCount = 0;
      let cart = null;

      if (userss) {
      
      cart = await Cart.findOne({ userId: userss._id });
      
      wishlistCount = userss.wishlist ? userss.wishlist.length : 0;
      cartCount = cart && cart.items ? cart.items.length : 0;
      }


      const user = await User.findById(users._id);

      // Extracting the page query parameter and setting default
      const page = parseInt(req.query.page) || 1;
      const limit = 5; // Number of transactions per page

      // Sort transactions by date (most recent first)
      const sortedTransactions = user.walletTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Calculate total transactions and total pages
      const totalTransactions = sortedTransactions.length;
      const totalPages = Math.ceil(totalTransactions / limit);

      // Calculate start and end index for slicing
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      // Get the current transactions for the page
      const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

      // Render the wallet view with transactions and pagination details
      res.render('wallet', {
          user,
          transactions: currentTransactions,
          currentPage: page,
          totalPages,
          limit,
          wishlistCount,
          cartCount
      });
  } catch (error) {
      console.log('loadWallet error', error.message);
      return res.status(404).redirect('/404')
  }
};


module.exports = {
  loadWallet,
  
};