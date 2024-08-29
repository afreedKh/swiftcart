const express = require('express');
const user_route =express();
const nocache = require('nocache')
const session = require('express-session')
const path = require('path')
const userController = require('../controller/userController')
const env = require("dotenv").config();
const passport= require('passport');
const auth = require("../middlewares/userAuth")
require("../passport");






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





user_route.get("/",auth.isLogout,userController.loadLandingpage);





user_route.get("/registration",auth.isLogout,userController.loadRegistration);
user_route.post("/registration",userController.insertUser);





user_route.get("/login",auth.isLogout,userController.loadLogin);
user_route.post("/login",userController.verifyLogin);





user_route.get("/auth/google", passport.authenticate('google',{
    scope:['email' , 'profile']
}))





user_route.get("/auth/google/callback",passport.authenticate('google',{
    successRedirect:"/success",
    failureRedirect:"/failure"
}));





user_route.get("/success",userController.successGoogleLogin)
user_route.get("/failure",userController.failureGoogleLogin)





user_route.post("/verifyOtp",userController.verifyOtp);
user_route.post("/resendOtp",userController.resendOtp);





user_route.get("/forgotPassword",userController.forgotPassword);
user_route.post("/forgotPassword",userController.forgotVerify)





user_route.get("/resetPassword",userController.resetPasswordLoad)
user_route.post("/resetPassword",userController.VerifyResetPassword)





user_route.get("/home",auth.isLogin,userController.loadUserHome)



user_route.get("/productDetails/:id",userController.loadProductDetails)






user_route.get("/account/:id",auth.isLogin,userController.loadAccountDetails)
user_route.post("/verifyAccountDetails/:id",userController.verifyAccountDetails)


user_route.get("/address/:id",auth.isLogin,userController.loadAddressDetails);
user_route.post("/verifyAddress/:id",userController.verifyAddress);
user_route.get("/address/edit/:id",auth.isLogin,userController.loadAddressEdit)
user_route.post("/updateAddress/:id",userController.updateAddress)
user_route.get("/address/delete/:id",auth.isLogin,userController.deleteAddress);








user_route.get("/wishlist",userController.loadWishlist)







user_route.get("/cart",userController.loadCart)
user_route.post("/cart",userController.verifyCart);
user_route.get("/cartDelete/:id",userController.deleteCartItems);


user_route.post("/checkout",userController.verifyCheckout)



user_route.get("/delivery/address/edit/:id",auth.isLogin,userController.loadDeliveryAddressEdit)
user_route.get("/delivery/address/delete/:id",auth.isLogin,userController.deliveryDeleteAddress);






user_route.post("/placeOrder",userController.loadPlaceOrder);

user_route.get("/logout",auth.isLogin,userController.loadLogout)



module.exports=user_route;