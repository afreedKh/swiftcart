const express = require('express');
const user_route =express();
const nocache = require('nocache')
const session = require('express-session')
const path = require('path')
const env = require("dotenv").config();
const passport= require('passport');
const auth = require("../middlewares/userAuth")
require("../passport");

const landingPageController = require("../controller/user/landingPageController");
const registrationController = require("../controller/user/registrationController");
const loginController = require("../controller/user/loginController");
const wishlistController = require("../controller/user/wishlistController");
const homePageController = require("../controller/user/homePageController");
const logoutController = require("../controller/user/logoutController");
const productController = require("../controller/user/productController");
const accountController = require("../controller/user/accountController");
const addressController = require("../controller/user/addressController");
const cartController = require("../controller/user/cartController");
const checkoutController = require("../controller/user/checkoutController");
const deliveryAddressController = require("../controller/user/deliveryAddressController");
const orderController = require("../controller/user/orderController");
const couponsController = require("../controller/user/couponsController");
const walletController = require("../controller/user/walletController");
const aboutController = require("../controller/user/aboutController");
const contactController = require("../controller/user/contactController")
const load404Controller = require("../controller/user/404Controller");



user_route.use(express.json());
user_route.use(express.urlencoded({extended:true}))
user_route.use(session({
    secret:process.env.SECRET_SESSION_ADMIN,
    name:'user_session',
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))


user_route.use(nocache());
user_route.set("view engine","ejs");
user_route.set('views','./views/usersViews')





user_route.use(passport.initialize());
user_route.use(passport.session());





user_route.get("/",auth.isLogout,landingPageController.loadLandingpage);





user_route.get("/registration",auth.isLogout,registrationController.loadRegistration);
user_route.post("/registration",auth.isLogout,registrationController.insertUser);





user_route.get("/login",auth.isLogout,loginController.loadLogin);
user_route.post("/login",auth.isLogout,loginController.verifyLogin);





user_route.get("/auth/google", passport.authenticate('google',{
    scope:['email' , 'profile']
}))





user_route.get("/auth/google/callback",passport.authenticate('google',{
    successRedirect:"/success",
    failureRedirect:"/failure"
}));





user_route.get("/success",registrationController.successGoogleLogin)
user_route.get("/failure",registrationController.failureGoogleLogin)





user_route.post("/verifyOtp",registrationController.verifyOtp);
user_route.post("/resendOtp",registrationController.resendOtp);





user_route.get("/forgotPassword",registrationController.forgotPassword);
user_route.post("/forgotPassword",registrationController.forgotVerify)





user_route.get("/resetPassword",registrationController.resetPasswordLoad)
user_route.post("/resetPassword",registrationController.VerifyResetPassword)





user_route.get("/home",auth.isLogin,homePageController.loadUserHome)



user_route.get("/productDetails/:id",productController.loadProductDetails)






user_route.get("/account/:id",auth.isLogin,accountController.loadAccountDetails)
user_route.post("/verifyAccountDetails/:id",auth.isLogin,accountController.verifyAccountDetails)


user_route.get("/address/:id",auth.isLogin,addressController.loadAddressDetails);
user_route.post("/verifyAddress/:id",auth.isLogin,addressController.verifyAddress);
user_route.get("/address/edit/:id",auth.isLogin,addressController.loadAddressEdit)
user_route.post("/updateAddress/:id",auth.isLogin,addressController.updateAddress)
user_route.get("/address/delete/:id",auth.isLogin,addressController.deleteAddress);



user_route.get("/logout",auth.isLogin,logoutController.loadLogout)





user_route.get("/wishlist",wishlistController.loadWishlist)
user_route.post("/wishlist/add/:productId", auth.isLogin,wishlistController.addToWishlist);
user_route.delete("/wishlist/remove/:productId", wishlistController.removeFromWishlist);






user_route.get("/cart",cartController.loadCart)
user_route.post("/cart",cartController.verifyCart);
user_route.get("/cartDelete/:id",auth.isLogin,cartController.deleteCartItems);

user_route.get("/checkout",auth.isLogin,checkoutController.loadCheckout)
user_route.post("/checkout",auth.isLogin,checkoutController.verifyCheckout)



user_route.get("/delivery/address/edit/:id",auth.isLogin,deliveryAddressController.loadDeliveryAddressEdit)
user_route.get("/delivery/address/delete/:id",auth.isLogin,deliveryAddressController.deliveryDeleteAddress);





user_route.post('/razorpay-success', orderController.handleRazorpaySuccess);
user_route.post("/placeOrder",auth.isLogin, orderController.loadPlaceOrder);
user_route.post("/razorpay-webhook", orderController.razorpayWebhook);
user_route.get("/orderSuccess",auth.isLogin ,orderController.loadOrderSuccessPage)
user_route.get("/orderFailure",auth.isLogin,orderController.loadOrderFailure)
user_route.post("/retryPayment/:orderId",auth.isLogin,orderController.retryPayment)

user_route.get("/orders/:id",auth.isLogin,orderController.loadOrders);
user_route.get("/orderDetails/:id",auth.isLogin,orderController.loadOrderDetails);

user_route.get("/retryOrderSuccess",auth.isLogin,orderController.retryOrderSuccess)
user_route.get("/retryOrderFailure",auth.isLogin,orderController.retryOrderFailure)

user_route.post("/orders/:id/cancel",auth.isLogin,orderController.cancelOrder)
user_route.post('/orders/:id/return', auth.isLogin,orderController.returnOrder);




user_route.get("/productList",productController.loadProductList)
user_route.get("/filter-products",productController.filterProduct)



user_route.get("/coupons",auth.isLogin,couponsController.loadCoupons)
user_route.post("/validate-coupon",auth.isLogin,couponsController.validateCoupon)
user_route.delete('/remove-coupon',auth.isLogin, couponsController.removeCoupon);






user_route.get("/wallet/:id",auth.isLogin,walletController.loadWallet)






user_route.get("/404",load404Controller.load404);
user_route.get("/about",aboutController.loadAbout)
user_route.get("/contact",contactController.loadContact);
user_route.post('/send-contact', contactController.sendContact);






module.exports=user_route;