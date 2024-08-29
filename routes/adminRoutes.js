const express = require('express');
const admin_route = express();
const multer = require('multer')

const nocache = require('nocache')
const session = require('express-session')
const path = require('path')
const adminController = require('../controller/adminController')
const env = require("dotenv").config();
const auth = require("../middlewares/adminAuth");
const uploadMiddleware = require('../middlewares/productUploadMiddleware')
const bannerUpload = require('../middlewares/bannerUploadMiddleware')





admin_route.use(express.json());
admin_route.use(express.urlencoded({extended: true}))






admin_route.use(session({
    secret:process.env.SECRET_SESSION_ADMIN,
    name:'admin_session',
    resave:false,
    saveUninitialized:true,
    cookie:{
        secure:false,
        httpOnly:true,
        maxAge:72*60*60*1000
    }
}))







admin_route.use(nocache());
admin_route.set("view engine","ejs");
admin_route.set('views','./views/adminViews')













admin_route.get("/",auth.isLogout,adminController.loadLogin)
admin_route.post("/",adminController.verifyLogin);
admin_route.get("/logout",auth.isLogin,adminController.loadLogout)




admin_route.get("/dashboard",auth.isLogin,adminController.loadDashboard);






admin_route.get("/banner",auth.isLogin,adminController.loadBanner);
admin_route.post("/uploadBanner",adminController.uploadBanner)
admin_route.get("/editBanner/:id",auth.isLogin,adminController.editBanner);
admin_route.post("/editBanner/:id",bannerUpload,adminController.updateBanner);
admin_route.get("/blockBanner/:id",auth.isLogin,adminController.blockBanner)
admin_route.get("/unblockBanner/:id",auth.isLogin,adminController.unblockBanner)




admin_route.get("/userManagement",auth.isLogin,adminController.userManagement)
admin_route.get("/block-user/:id",auth.isLogin,adminController.blockUser)
admin_route.get("/unblock-user/:id",auth.isLogin,adminController.unblockUser)





admin_route.get("/categories",auth.isLogin,adminController.categories);
admin_route.get("/addCategories",auth.isLogin,adminController.addCategories);
admin_route.post("/verifyCategories",adminController.verifyCategories);
admin_route.get("/editCategories/:id",auth.isLogin,adminController.editCategories);
admin_route.post("/updateCategories/:id",adminController.updateCategories)
admin_route.get("/blockCategories/:id",auth.isLogin,adminController.blockCategories);
admin_route.get("/unblockCategories/:id",auth.isLogin,adminController.unblockCategories);











admin_route.get("/product",auth.isLogin,adminController.loadProduct);
admin_route.get("/addProduct",auth.isLogin,adminController.addProduct)
admin_route.get("/editProduct/:id",auth.isLogin,adminController.editProduct)
admin_route.post("/addProduct",uploadMiddleware.any(), adminController.uploadProduct);
admin_route.post('/updateProduct/:id', uploadMiddleware.any(),adminController.updateProduct)
admin_route.get("/blockProduct/:id",adminController.blockProduct)
admin_route.get("/unblockProduct/:id",adminController.unblockProduct)
admin_route.get("/deleteImages/:id",adminController.deleteImages)














admin_route.get('*',function(req,res){
    res.redirect('/admin')
})


module.exports = admin_route;