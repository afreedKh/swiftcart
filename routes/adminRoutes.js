const express = require('express');
const admin_route = express();
const multer = require('multer')

const nocache = require('nocache')
const session = require('express-session')
const path = require('path')
const env = require("dotenv").config();
const auth = require("../middlewares/adminAuth");
const uploadMiddleware = require('../middlewares/productUploadMiddleware')
const bannerUpload = require('../middlewares/bannerUploadMiddleware')

const loginController = require('../controller/admin/loginController');
const dashboardController = require("../controller/admin/dashboardController");
const bannerController = require("../controller/admin/bannerController");
const userController = require("../controller/admin/userController");
const categoryController = require("../controller/admin/categoryController");
const logoutController = require("../controller/admin/logoutController")
const productController = require("../controller/admin/productController")
const orderController = require("../controller/admin/orderController");
const couponController = require("../controller/admin/couponController");
const offerController = require("../controller/admin/offerController");
const brandController =require("../controller/admin/brandController");


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













admin_route.get("/",auth.isLogout,loginController.loadLogin);
admin_route.post("/",auth.isLogout, loginController.verifyLogin);
admin_route.get("/logout",auth.isLogin,logoutController.loadLogout)




admin_route.get('/dashboard', auth.isLogin, dashboardController.loadDashboard);
admin_route.post('/generate-sales-report',auth.isLogin, dashboardController.generateSalesReport);







admin_route.get("/banner",auth.isLogin,bannerController.loadBanner);
admin_route.post("/uploadBanner",auth.isLogin,bannerController.uploadBanner)
admin_route.get("/editBanner/:id",auth.isLogin,bannerController.editBanner);
admin_route.post("/editBanner/:id",auth.isLogin,bannerUpload,bannerController.updateBanner);
admin_route.get("/blockBanner/:id",auth.isLogin,bannerController.blockBanner)
admin_route.get("/unblockBanner/:id",auth.isLogin,bannerController.unblockBanner)




admin_route.get("/userManagement",auth.isLogin,userController.userManagement)
admin_route.get("/block-user/:id",auth.isLogin,userController.blockUser)
admin_route.get("/unblock-user/:id",auth.isLogin,userController.unblockUser)





admin_route.get("/categories",auth.isLogin,categoryController.categories);
admin_route.get("/addCategories",auth.isLogin,categoryController.addCategories);
admin_route.post("/verifyCategories",auth.isLogin,categoryController.verifyCategories);
admin_route.get("/editCategories/:id",auth.isLogin,categoryController.editCategories);
admin_route.post("/updateCategories/:id",auth.isLogin,categoryController.updateCategories)
admin_route.get("/blockCategories/:id",auth.isLogin,categoryController.blockCategories);
admin_route.get("/unblockCategories/:id",auth.isLogin,categoryController.unblockCategories);











admin_route.get("/product",auth.isLogin,productController.loadProduct);
admin_route.get("/addProduct",auth.isLogin,productController.addProduct)
admin_route.get("/editProduct/:id",auth.isLogin,productController.editProduct)
admin_route.post("/addProduct",uploadMiddleware.any(), productController.uploadProduct);
admin_route.post('/updateProduct/:id', uploadMiddleware.any(),productController.updateProduct);
admin_route.get("/blockProduct/:id",auth.isLogin,productController.blockProduct);
admin_route.get("/unblockProduct/:id",auth.isLogin,productController.unblockProduct);
admin_route.delete("/deleteImage/:id",auth.isLogin,productController.deleteImages);








admin_route.get("/orders",auth.isLogin,orderController.loadOrders)
admin_route.get("/orders/:id",auth.isLogin,orderController.loadOrderDetails);
admin_route.post("/orders/:id/cancel",auth.isLogin,orderController.cancelOrder);
admin_route.post("/orders/:id/updateStatus",auth.isLogin,orderController.updateOrderStatus)
admin_route.post("/orders/:id/approve-return",auth.isLogin,orderController.approveReturn);
admin_route.post("/orders/:id/cancel-return",auth.isLogin,orderController.cancelReturn);






admin_route.get("/coupons",auth.isLogin,couponController.getAllCoupons)
admin_route.get("/addCoupons",auth.isLogin,couponController.addCoupons);
admin_route.post("/addCoupons",auth.isLogin,couponController.uploadCoupons);
admin_route.get("/editCoupons/:id",auth.isLogin,couponController.editCoupons);
admin_route.put("/updateCoupons/:id",auth.isLogin,couponController.updateCoupons)
admin_route.put("/activateCoupon/:id", auth.isLogin,couponController.activateCoupon);
admin_route.delete("/deactivateCoupon/:id", auth.isLogin,couponController.deactivateCoupon);










admin_route.get("/offers",auth.isLogin,offerController.loadOffer)
admin_route.get("/addOffer",auth.isLogin,offerController.loadAddOffer);
admin_route.post("/addOffer",auth.isLogin,offerController.addOffer)
admin_route.get("/editOffer/:id",auth.isLogin,offerController.loadEditOffer);
admin_route.put("/editOffer/:id",auth.isLogin,offerController.updateOffer)
admin_route.put("/activateOffer/:id",auth.isLogin,offerController.activateOffer);
admin_route.delete("/deactivateOffer/:id",auth.isLogin,offerController.deactivateOffer);









admin_route.get("/brands",auth.isLogin,brandController.loadBrands)
admin_route.get("/addBrands",auth.isLogin,brandController.addBrands)
admin_route.post("/verifyBrands",auth.isLogin,brandController.verifyBrands);
admin_route.get("/editBrands/:id",auth.isLogin,brandController.editBrands);
admin_route.post("/updateBrands/:id",auth.isLogin,brandController.updateBrands);
admin_route.get("/blockBrands/:id",auth.isLogin,brandController.blockBrands);
admin_route.get("/unblockBrands/:id",auth.isLogin,brandController.unblockBrands);







admin_route.use((req, res, next) => {
    res.status(404).render('404', { message: "Page not found!" }); // Adjust the view and message as needed
});

module.exports = admin_route;