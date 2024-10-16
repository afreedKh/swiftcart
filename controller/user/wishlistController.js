const User = require("../../models/userModel");
const Product = require("../../models/productModel");
const passport = require("passport");
const Cart = require("../../models/cartModel")

const loadWishlist = async(req,res)=>{
    try {
     
      const users = req.session.user||req.session.passport
       
        if(!users){
          return res.redirect('/login')
        }else{
         
          const userId = users._id
         
          
          
          const user = await User.findById(userId).populate({
            path: 'wishlist',
            populate: {
                path: 'offer' 
            }
        });
        let cartCount = 0;
          let wishlistCount=0;
          let cart = null
          if (!user.wishlist||user.wishlist=='') {
            
            return res.render("emptyWishlist");
        }

        if(users){
          cart = await Cart.findOne({ userId: user._id });
          wishlistCount = user.wishlist ? user.wishlist.length : 0;
          cartCount = cart && cart.items ? cart.items.length : 0;
        }else{
          wishlistCount=0;
        }


           
             res.render("wishlist",{ wishlistItems: user.wishlist ,wishlistCount,cartCount})
        }
       
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return res.status(404).redirect('/404')
    }
}




const addToWishlist = async (req, res) => {
  try {
   
     
    const users = req.session.user||req.session.passport
      if (!users) {
        
          return res.redirect("/login");
      }
     
      const userId = users._id;
      const productId = req.params.productId;
      
      const user = await User.findById(userId);
      if (!user.wishlist.includes(productId)) {
          user.wishlist.push(productId);
          await user.save();
          res.json({ message: 'Product added to wishlist' });
      } else {
          res.json({ message: 'Product already in wishlist' });
      }
  } catch (error) {
      console.error('Error adding to wishlist:', error);
      return res.status(404).redirect('/404')
  }
};


  const removeFromWishlist = async (req, res) => {
    try {

      const users = req.session.user||req.session.passport
      if (!users) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
     
      const userId = users._id;
      const productId = req.params.productId;
      
      await User.findByIdAndUpdate(userId, { $pull: { wishlist: productId } });
      
      res.json({ message: 'Product removed from wishlist' });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return res.status(404).redirect('/404')
    }
  };



module.exports={
    loadWishlist,
    addToWishlist,
    removeFromWishlist
}