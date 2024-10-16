const Cart = require("../../models/cartModel");
const Product = require("../../models/productModel");
const Offer = require("../../models/offerModel");
const User = require("../../models/userModel")



const loadCart = async (req, res) => {
  try {


   const user = req.session.user||req.session.passport;
  
   
   
    
      if (!user) {
          return res.redirect("/login");
      }

      let users
      if(user){
       users= await User.findById(user._id)
      }

      let wishlistCount = 0

      if(users){
        wishlistCount = users.wishlist ? users.wishlist.length : 0;
      }

      


      const cart = await Cart.findOne({ userId:user._id })
          .populate({
              path: 'items.productId',
              populate: {
                  path: 'offer'
              }
          });

          
          

     

      if (!cart || cart.items.length === 0) {
          return res.render("emptyCart");
      }

     
      cart.items = cart.items.map(item => {
          

          let price = item.productId.price;

          if (item.productId.offer && 
              item.productId.offer.isActive && 
              new Date() >= new Date(item.productId.offer.startDate) && 
              new Date() <= new Date(item.productId.offer.endDate)) {
              price = price * (1 - item.productId.offer.discount / 100);
              
          }
          item.price = price;
          return item;
      });

      await cart.save();

     

      cart.items.sort((a, b) => b.createdAt - a.createdAt);
      
      const cartCount = cart.items.length;
      
      res.render("cart", { cart, cartCount ,wishlistCount});
      
  } catch (error) {
      console.log("Load cart error", error.message);
      return res.status(404).redirect('/404')

  }
};













const verifyCart = async (req, res) => {
  try {
    
    
    const { userId, productId, varientId, quantity } = req.body;
   
    
    
    
    
    if (!userId || !productId || !varientId || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    
    const product = await Product.findById(productId).populate('offer');

    let price = product.price;

   
    if (product.offer && product.offer.isActive && new Date() >= product.offer.startDate && new Date() <= product.offer.endDate) {
      price = price * (1 - product.offer.discount / 100);
    }

    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.varientId.toString() === varientId
    );

    if (existingItemIndex !== -1) {
      cart.items[existingItemIndex].quantity = quantity;
      cart.items[existingItemIndex].price = price;
    } else {
      cart.items.push({ productId, varientId, quantity, price }); 
    }

    await cart.save();

    res.json({ success: true, cart });

  } catch (error) {
    console.log('verify cart error ', error.message);
    return res.status(404).redirect('/404')

  }
};










const deleteCartItems = async(req,res)=>{
    try {


      const user = req.session.user||req.session.passport;

        const itemsId = req.params.id;
        const userId = user
        const cart = await Cart.findOne({userId});

        if (!cart) {
          return res.status(404).redirect('/404')
        }

        cart.items = cart.items.filter(item => item._id.toString()!== itemsId);

        await cart.save();

        res.redirect('/cart');
        
    } catch (error) {
        console.log('deleteCartItems error',error.message);
        return res.status(404).redirect('/404')


    }
}








module.exports={
    loadCart,
    verifyCart,
    deleteCartItems,

}