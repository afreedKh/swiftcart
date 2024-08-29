    const UserData = require('../models/userModel');
    const bcrypt = require('bcrypt')
    const nodemailer = require('nodemailer');
    const dotenv = require("dotenv").config();
    const randomstring = require("randomstring");
    const Banner = require("../models/bannerModel");
    const Category = require('../models/categoryModel');
    const Product = require("../models/productModel");
    const Cart = require("../models/cartModel");



    //SECURE PASSWORD STARTS FROM HERE 
    const securePassword= async(password)=>{
        try {
        const sPassword = await bcrypt.hash(password,10);
        return sPassword;

        } catch (error) {
            console.log('Password security error',error.message);
        }
    }
    //SECURE PASSWORD STARTS ENDS HERE 







    //GENERATING OTP STARTS FROM HERE 
    const generateOtp = ()=>{
        return Math.floor(1000+Math.random()*9000);
    }
    //GERERATING OTP ENDS HEREFROM








    //SENDING VERIFICATION EMAIL OTP STARTS FROM HERE 
    const sendVerificationEmail = async (email,otp)=>{
        try {
            const transporter =  nodemailer.createTransport({
                service:"gmail",
                port:587,
                secure:false,
                requireTLS:true,
                auth:{
                    user:process.env.NODEMAILER_EMAIL,
                    pass:process.env.NODEMAILER_PASSWORD
                },
            })

            const info = await transporter.sendMail({
                from:process.env.NODEMAILER_EMAIL,
                to:email,
                subject:"Verify your account",
                text:`Your OTP is ${otp}`,
                html:`<b>Your OTP:${otp}</b>`
            })

            return info.accepted.length>0

        } catch (error) {
            console.log("Sent verification email error",error.message);
            return false
        }
    }
    //SENDING VERIFICATION EMAIL ENDS HERE








    //SENDING VERIFICATION EMAIL FOR RESET PASSWORD STARTS FROM HERE
    const sendResetPasswordEmail = async (name,email,token)=>{
        try {
            const transporter =  nodemailer.createTransport({

                service:"gmail",
                port:587,
                secure:false,
                requireTLS:true,
                auth:{
                    user:process.env.NODEMAILER_EMAIL,
                    pass:process.env.NODEMAILER_PASSWORD
                }
            })

            const info = await transporter.sendMail({
                from:process.env.NODEMAILER_EMAIL,
                to:email,
                subject:"For Reset Password",
                html:`<p>Hii ${name} please click here to <a href="http://localhost:3000/resetPassword?token=${token}"> Reset</a> your password</p>`
            })

            return info.accepted.length>0

        } catch (error) {
            console.log("Sent verification email error",error.message);
            return false
        }
    }
    //SENDING VERIFICATION EMAIL FOR RESET PASSWORD ENDS HERE










    //LANDING PAGE LOADS FROM HERE  
    const loadLandingpage = async(req,res)=>{
        try {
            const logout = req.query.logout || null;
            const product = await Product.aggregate([{$match:{isDeleted:false}}])
            const banners = await Banner.aggregate([{$match:{isDeleted:false}}])
            const categories = await Category.aggregate([{$match:{isDeleted:false}}])
            
            res.render("home",{banners,categories,logout,product});
           
        } catch (error) {
            console.log('LoadHome page error ',error.message);
        }
    }
    //LANDING PAGE LOADS ENDS HERE 







    //REGISTER PAGE LOADS FROM HERE  
    const loadRegistration = async(req,res)=>{
        try {
            res.render("registration");
        } catch (error) {
            console.log('LoadRegistration page error ',error.message);
        }
    }
      //REGISTER PAGE LOADS ENDS HERE  

    







    //NEW USER REGISTRATION STARTS FROM HERE
    const insertUser =async(req,res)=>{
        try {

            const {name,email,phone,password,confirmPassword}=req.body;

            const sPassword = await securePassword(password);

            const validateEmail = (email) => {
                return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
            };

            const validateName = (name) => {
                return String(name)
                .toLowerCase()
                .match(
                   
                    /^[A-Za-z\s]+$/
                );
            };

            const validatePhone = (phone) => {
                return /^[0-9]{10}$/.test(phone);
            };
            

            const validationErrors = {};
            


            if (!validateEmail(email)||email==="") {
               
                validationErrors.invalidEmail = "Invalid email";
            }

            
            if (!validateName(name)||name==="") {
               
               validationErrors.invalidName = "Invalid name";
            }

            if (!validatePhone(phone)||phone==="") {
               
                validationErrors.invalidPhone = "Enter valid mobile";
             }
            
            if (password!==confirmPassword) {
                
                validationErrors.invalidPassword = "Password do not match";
            }

            if(password.length<8 ){
                
                validationErrors.pass ="Password length must be 8 characters "
               
            }
            const alreadyExits = await UserData.findOne({email})

            if(alreadyExits){
                validationErrors.invalidEmail = "Email already Exits"
            }

            

            if (Object.keys(validationErrors).length > 0) {
                validationErrors.name=name
                validationErrors.email=email
                validationErrors.phone=phone
                validationErrors.password=password
                return res.render("registration", validationErrors);
            } 
            else {
                const User = new UserData({name,email,phone,password:sPassword,confirmPassword:sPassword})
                
                const otp = generateOtp();

                const emailSent = await sendVerificationEmail(email,otp);

                req.session.userOtp =otp;
                req.session.userDatas=User;      


                if(!emailSent){
                return res.json("Email Error");
                }else{
                    res.render("otp")   
                }            
            }

        } catch (error) {
            console.log('verified error',error.message);
            res.status(500).send('Internal Server Error');
        }
    }

    //NEW USER REGISTRATION ENDS FROM HERE









    //LOGIN PAGE WILL LOAD HERE
    const loadLogin = async(req,res)=>{
        try {
            res.render("login");
        } catch (error) {
            console.log('loadLogin page error ',error.message);
        }
    }
    //LOGIN PAGE ENDS LOAD HERE




    //VERIFY LOGIN STARTS FROM HERE
    const verifyLogin = async(req,res)=>{
        try {

            const email = req.body.email

            const validateEmail = (email) => {
                return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
            };

            


            const validationErrors = {};

            if (!validateEmail(email)||email==="") {
                validationErrors.invalidEmail = "Invalid email";
            }

            
           
            if (Object.keys(validationErrors).length > 0) {
                validationErrors.email=email
                return res.render("login", validationErrors);


                
            }else{
            const password= req.body.password;
            const User= await UserData.findOne({email});
            
            if(User){
                if(User.isBlocked===true){
                                return res.render("login",{message:"!User not found",email})
                            }
                const Userdata = await bcrypt.compare(password,User.password)
                
                
                if(Userdata&&User.is_admin===0){
                    req.session.user=User
                    res.redirect("/home")
                }else{
                    res.render("login",{passwordIncorrect:"Your password is incorrect",email})
                }

            }else{
                res.render("login",{message:"!User not found",email});
            }
            }
        } catch (error) {
            console.log("VerifyLogin page error",error.message);
        }
    }

     //VERIFY LOGIN ENDS  HERE







    //VERIFY OTP STARTS FROM HERE 
    const verifyOtp = async (req, res) => {
        try {
            const { otp } = req.body;

            if (otp == req.session.userOtp) {
                const user = new UserData(req.session.userDatas);
                user.is_admin=0;                                   
                await user.save();
                res.json({ success: true, redirectUrl: "/login" });
            } else {
                res.status(400).json({ success: false, message: "Invalid OTP" });
            }
        } catch (error) {
            console.log("Verify otp error", error.message);
            res.status(500).json({ success: false, message: "An error occurred" });
        }
    };
    //VERIFY OTP  ENDS HERE 









    //RESEND OTP CONTROLLERS START FROM HERE
    const resendOtp = async (req, res) => {
        try {
            const otp = generateOtp();  // Generate a new OTP
            req.session.userOtp = otp;  // Save the new OTP in session

            const email = req.session.userDatas.email; // Retrieve email from session
            const emailSent = await sendVerificationEmail(email, otp); // Send OTP email

            if (emailSent) {
                res.json({ success: true, message: "OTP resent successfully" });
            } else {
                res.status(500).json({ success: false, message: "Failed to resend OTP" });
            }
        } catch (error) {
            console.log("Resend OTP error", error.message);
            res.status(500).json({ success: false, message: "An error occurred" });
        }
    };
    //RESEND OTP CONTROLLERS ENDS  HERE









    //GOOGLE LOGIN CONTROLLER START HERE

    const successGoogleLogin = (req,res)=>{
        req.session.passport = req.user;
        res.redirect("/home")
    
    }

    const failureGoogleLogin = (req,res)=>{
        res.send("error")
    }
    //GOOGLE LOGIN CONTROLLER ENDS HERE




    


    //FORGOT PASSWORD STARTS FROM HERE  
    const forgotPassword = async(req,res)=>{
        try {

            res.render("forgotPassword")
            
        } catch (error) {
            console.log('Forgott password logic error',error.message);
        }
    }
    //FORGOT PASSWORD ENDS HERE







    //FORGOT EMAIL VERIFY START FROM HERE
    const forgotVerify = async(req,res)=>{
        try {
            const email = req.body.email
            const user = await UserData.findOne({email})
            
           
           if(user){
                const randomString = randomstring.generate();
                await UserData.updateOne({email},{$set:{token:randomString}})
                sendResetPasswordEmail(user.name,user.email,randomString);
                res.render("forgotPassword",{message:"Please check your mail to reset your password"});
           }else{
                 res.render("forgotPassword",{message:"User Email is incorrect"})
           }

        } catch (error) {
            console.log("Forgot verify error ",error.message);
        }
    }
    //FORGOT EMAIL VERIFY ENDS HERE





    //FORGET PASSWORD RESET PAGE LOAD STARTS FROM HERE
    const resetPasswordLoad = async(req,res)=>{
        try {
            const token = req.query.token;  
            const tokenData = await UserData.findOne({token})
            if(tokenData){
                res.render("resetPassword",{user_id:tokenData._id})
                }else{
                res.render("404",{message:"Token is invalid"})
            }

        } catch (error) {
            console.log("forget password reset page load error ",error.message);
        }
    }
    //FORGET PASSWORD RESET PAGE LOAD ENDS  HERE








    //VERIFY RESET PASSWORDS STARTS FROM HERE

    const VerifyResetPassword = async(req,res)=>{
        try {
            const password = req.body.password;
            const user_id = req.body.user_id;

            const securepassword = await securePassword(password)
            await UserData.findByIdAndUpdate({_id:user_id},{$set:{password:securepassword,token:''}})
            res.redirect("/login");
        } catch (error) {
            console.log("verify reset password error", error.message);
        }
    }
    //VERIFY RESET PASSWORDS ENDS HERE









    //LOAD WISHLIST STARTS FROM HERE

    const loadWishlist = async(req,res)=>{
        try {

            if(req.session.user){
                res.render("wishlist");
            }else{
                res.redirect("/login");
            }
            
        } catch (error) {
            console.log("Load wishlist error ",error.message);
        }
    }

    //LOAD WISHLIST ENDS  HERE








   

  


    const loadUserHome = async(req, res) => {
        try {
            if (req.session.user || req.session.passport) {
                const user = req.session.user;
                const passport = req.session.passport;
                const categories = await Category.aggregate([{$match: {isDeleted: false}}]);
                const banners = await Banner.aggregate([{$match: {isDeleted: false}}]);
                const product = await Product.aggregate([{$match:{isDeleted:false}}])
                const cart = await Cart.findOne({userId:user._id})
            
              
                let name;
                if (user) {
                    name = "Hello " + user.name;
                } else if (passport) {
                    name = "Hello " + passport.displayName;
                }
                let cartCount;

                if(cart&&cart.items){
                     cartCount  = cart.items.length
                }else{
                    cartCount=0;
                }
                
    
                res.render("home", {
                    name: name,
                    user:user,
                    banners: banners,
                    categories: categories,
                    isLoggedIn: true,
                    product:product,
                    cartCount
                });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.log("load user home page error", error.message);
        }
    };

    





    const loadLogout = async(req,res)=>{
        try {
            if(req.session&&req.session.user){
                delete req.session.user
            }else if(req.session&&req.session.passport){
                delete req.session.passport
            }
            res.redirect("/?logout=Logout successfully")



        } catch (error) {
            console.log('load logout error ',error.message);
        }
    }







    const loadProductDetails = async(req,res)=>{
        try {

            const product = await Product.findById(req.params.id)
            const users = req.session.user;
           
            let user;
            if(users){
                user = users
            }else{
                user =[]
            }

            const cart = await Cart.findOne({userId:users._id})
            
            let cartCount;

            if(cart&&cart.items){
                cartCount = cart.items.length;
            }else{
                cartCount=0;
            }
           
            
            res.render("productDetails",{product,user,cartCount,breadcrumbs:[
                {name:"Home", url:'/'},
                {name:"Product Details",url:"#"}
            ]});

        } catch (error) {
            console.log('loadProductDetails error',error.message);
        }
    }




    const loadAccountDetails = async(req,res)=>{
        try {
            const user = await  UserData.findById(req.params.id)
          
           return res.render("account",{user})

        } catch (error) {
          
            console.log('loadAccount error',error.message);
        }
    }






    const verifyAccountDetails = async(req,res)=>{
        try {

            
            const user = req.params.id
            const email = req.body.email
            const name = req.body.name
            const phone = req.body.phone
            const gender = req.body.gender

            const validateEmail = (email) => {
                return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
            };

            const validateName = (name) => {
                return String(name)
                .toLowerCase()
                .match(
                   
                    /^[A-Za-z\s]+$/
                );
            };

            const validatePhone = (phone) => {
                return /^[0-9]{10}$/.test(phone);
            };

            const validationErrors = {}
            
            if (!validateEmail(email)||email==="") {
            
                validationErrors.invalidEmail = "Invalid email";
            }

            
            if (!validateName(name)||name==="") {
               
               validationErrors.invalidName = "Invalid name";
            }

            if (!validatePhone(phone)||phone==="") {
               
                validationErrors.invalidPhone = "Enter valid mobile";
             }

             if(Object.keys(validationErrors).length>0){
                res.json({success:false,errors:validationErrors})
             }else{

             
            

           const updated =  await UserData.findByIdAndUpdate(user,{$set:{
                gender,
                name,
                email,
                phone
        }},{new:true})


            if(updated){
                res.json({ success: true, message: "Account details updated successfully!" });
            }
             }
        } catch (error) {
            console.log("verifyAccountDetails error",error.message);
             res.status(500).json({ success: false, message: "An error occurred while updating account details." });
            
        }
    }






    const loadAddressDetails = async(req,res)=>{
        try {

            const user = await UserData.findById(req.params.id);
            user.addressess.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            res.render("address",{user})

            
        } catch (error) {
            console.log('loadAddressDeatials error',error.message);
        }
    }



    const verifyAddress = async(req,res)=>{
        try { 
             
            const user = await UserData.findById(req.params.id)

            const {name,phone,pincode,locality,address,city,state,landmark,alternatePhone,addressType}=req.body


            const validateName = (name) => {
                return String(name)
                .toLowerCase()
                .match(
                   
                    /^[A-Za-z\s]+$/
                );
            };

            const validatePhone = (phone) => {
                return /^[0-9]{10}$/.test(phone);
            };

            



            const validationErrors = {};



            if (!validateName(name)||name==="") {
               
                validationErrors.invalidName = "Invalid name";
             }
 
             if (!validatePhone(phone)||phone==="") {
                
                 validationErrors.invalidPhone = "Enter valid mobile";
            }

            if(pincode<6||pincode===''||!/^\d{6}$/.test(pincode)){

                validationErrors.invalidPincode = "Enter valid pincode"
            }

            if (!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(locality)) {
                validationErrors.invalidLocality = "Locality should be 3 characters long ";
            }

            if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(address)){
                validationErrors.invalidAddress = "Address(Area and Street) should be 3 characters long";
            }

            if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(city)){
                validationErrors.invalidCity = "City/District/Town should be 3 characters long";
            }

            if (!validateName(state)||state==="") {
               
                validationErrors.invalidState = "Invalid state";
            }

            if(landmark){
                if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(landmark)){
                    validationErrors.invalidLandmark = "Landmark should be 3 characters long";
                }
            }

            if(alternatePhone){
                if (!validatePhone(alternatePhone)||alternatePhone==="") {
                
                    validationErrors.invalidAlternatePhone = "Enter valid mobile";
               }
            }


            if(Object.keys(validationErrors).length>0){
                res.json({success:false,errors:validationErrors});
            }else{

             

            await user.addressess.push(req.body);

            await user.save();
           
            res.json({success:true,message:"New address added successfully"})

         }
        } catch (error) {
            console.log('verifyAddress error',error.message);
            res.json({success:false,message: "An error occurred while adding address details."})

        }
    }





    const loadAddressEdit = async (req, res) => {
        try {
            const userId = req.session.user._id; 
            const addressId = req.params.id;
    
           
            const user = await UserData.findById(userId).populate('addressess'); 
            
    
            const address = user.addressess.id(addressId);
            if (!address) {
                return res.status(404).send('Address not found');
            }
    
            res.render("editAddress", { address, user });
    
        } catch (error) {
            console.log('loadAddressEdit error', error.message);
            res.status(500).send('Internal Server Error');
        }
    }
    




    const updateAddress = async(req,res)=>{
        try {

            const addressId = req.params.id;
            const user = req.session.user; 
            const userId = user._id
            

            const {name,phone,pincode,locality,address,city,state,landmark,alternatePhone,addressType}=req.body


            const validateName = (name) => {
                return String(name)
                .toLowerCase()
                .match(
                   
                    /^[A-Za-z\s]+$/
                );
            };

            const validatePhone = (phone) => {
                return /^[0-9]{10}$/.test(phone);
            };

            



            const validationErrors = {};



            if (!validateName(name)||name==="") {
               
                validationErrors.invalidName = "Invalid name";
             }
 
             if (!validatePhone(phone)||phone==="") {
                
                 validationErrors.invalidPhone = "Enter valid mobile";
            }

            if(pincode<6||pincode===''||!/^\d{6}$/.test(pincode)){

                validationErrors.invalidPincode = "Enter valid pincode"
            }

            if (!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(locality)) {
                validationErrors.invalidLocality = "Locality should be 3 characters long ";
            }

            if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(address)){
                validationErrors.invalidAddress = "Address(Area and Street) should be 3 characters long";
            }

            if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(city)){
                validationErrors.invalidCity = "City/District/Town should be 3 characters long";
            }

            if (!validateName(state)||state==="") {
               
                validationErrors.invalidState = "Invalid state";
            }

            if(landmark){
                if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(landmark)){
                    validationErrors.invalidLandmark = "Landmark should be 3 characters long";
                }
            }

            if(alternatePhone){
                if (!validatePhone(alternatePhone)||alternatePhone==="") {
                
                    validationErrors.invalidAlternatePhone = "Enter valid mobile";
               }
            }


            if(Object.keys(validationErrors).length>0){
                res.json({success:false,errors:validationErrors});
            }else{

             

          

           const updateAddress = await UserData.findOneAndUpdate({
            _id:userId,
            'addressess._id' :addressId
           },{
            $set:{
                'addressess.$.name': name,
                'addressess.$.phone': phone,
                'addressess.$.pincode': pincode,
                'addressess.$.locality': locality,
                'addressess.$.address': address,
                'addressess.$.city': city,
                'addressess.$.state': state,
                'addressess.$.landmark': landmark,
                'addressess.$.alternatePhone': alternatePhone,
                'addressess.$.addressType': addressType
            }
           },{new:true})



           await updateAddress.save()
            
                
            res.json({success:true,message:"New address added successfully"})

         }
            

        } catch (error) {
            console.log('updateAddress error',error.message);
        }
    }







    const deleteAddress = async(req,res)=>{
        try {

            const addressId = req.params.id
            const userId = req.session.user._id


            await UserData.findOneAndUpdate({
                _id:userId,
            },{$pull:{addressess:{_id:addressId}}},
        {new:true});


        res.redirect(`/address/${userId}?success=Deleted Successfully`);


        } catch (error) {
            console.log('deleteAddress error',error.message);
        }
    }









     //LOAD ADD-TO-CART PAGE STARTS FROM HERE
     const loadCart = async (req, res) => {
        try {
            if (!req.session.user) {
                return res.redirect("/login");
            }
    
            const cart = await Cart.findOne({ userId: req.session.user._id })
                .populate({
                    path: 'items.productId',
                })
    
            if (!cart||cart.items=='') {
                
                return res.render("emptyCart");
            }



            cart.items.sort((a, b) => b.createdAt - a.createdAt);

            
            const cartCount  = cart.items.length

            
            res.render("cart", { cart ,cartCount});
            
        } catch (error) {
            console.log("Load cart error", error.message);
            res.status(500).send("Server error");
        }
    };
    
    
    //LOAD ADD-TO-CART PAGE ENDS  HERE














    const verifyCart = async(req,res)=>{
        try {

            const { userId, productId, varientId, quantity } = req.body;
            
            if (!userId || !productId || !varientId || !quantity) {
                return res.status(400).json({ success: false, message: 'Missing required fields' });
            }
    
            let cart = await Cart.findOne({ userId });
    
            if (!cart) {
                cart = new Cart({ userId, items: [] });
            }
    
            const existingItemIndex = cart.items.findIndex(
                item => item.productId == productId && item.varientId == varientId
            );

    
            
            if (existingItemIndex !== -1) {
                cart.items[existingItemIndex].quantity = quantity;
            } else {
                cart.items.push({ productId, varientId, quantity });
            }
    
            await cart.save();
    
           
            res.json({ success: true, cart });
            
        } catch (error) {
            console.log('verify cart error ', error.message);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    }











    const deleteCartItems = async(req,res)=>{
        try {

            const itemsId = req.params.id;
            const userId = req.session.user._id;
            const cart = await Cart.findOne({userId});

            if (!cart) {
                return res.status(404).json({ success: false, message: 'Cart not found' });
            }

            cart.items = cart.items.filter(item => item._id.toString()!== itemsId);

            await cart.save();

            res.redirect('/cart');
            
        } catch (error) {
            console.log('deleteCartItems error',error.message);
            res.status(500).json({ success: false, message: 'Server error' });

        }
    }




    // const loadCheckout = async(req,res)=>{
      
    //         try {
    //             const itemsObject = req.body.items;
    //             const user = await UserData.findById(req.session.user._id);
    //             user.addressess.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    
    //             // const items = await Promise.all(Object.values(itemsObject).map(async (item) => {
    //             //     const product = await Product.findById(item.productId);
    //             //     const variant = product.varients.find(v => v._id.toString() === item.varientId);
    //             //     const itemPrice = parseFloat(item.price);
    //             //     const itemTotal = itemPrice * item.quantity;
    //             //     return {
    //             //       ...item,
    //             //       product: product,
    //             //       variant: variant,
    //             //       itemTotal: itemTotal
    //             //     };
    //             //   }));
    //             //   const subtotal = items.reduce((acc, item) => acc + item.itemTotal, 0);
    //             //   const shipping = 100; // Fixed shipping rate
    //             //   const total = subtotal + shipping;
    
    //             res.render("checkout",{user})
                
           
    //     } catch (error) {
    //         console.log('loadCheckout error',error.message);
    //     }
    // }








    const  verifyCheckout = async(req,res)=>{
        try {
            const itemsObject = req.body.items;
            const user = await UserData.findById(req.session.user._id);
            user.addressess.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


            const items = await Promise.all(Object.values(itemsObject).map(async (item) => {
                const product = await Product.findById(item.productId);
                const variant = product.varients.find(v => v._id.toString() === item.varientId);
                const itemPrice = parseFloat(item.price);
                const itemTotal = itemPrice * item.quantity;
                return {
                  ...item,
                  product: product,
                  variant: variant,
                  itemTotal: itemTotal
                };
              }));
              const subtotal = items.reduce((acc, item) => acc + item.itemTotal, 0);
              const shipping = 100; // Fixed shipping rate
              const total = subtotal + shipping;

            res.render("checkout",{user,items,subtotal})
            
        } catch (error) {
            console.log('verifyCheckout error',error.message);
        }
    }






    const loadDeliveryAddressEdit = async(req,res)=>{
        try {

           
            const userId = req.session.user._id; 
            const addressId = req.params.id;
    
           
            const user = await UserData.findById(userId).populate('addressess'); 
            
    
            const address = user.addressess.id(addressId);
            if (!address) {
                return res.status(404).send('Address not found');
            }
    
            res.render("deliveryAddressEdit", { address, user });
    

            
        } catch (error) {
            console.log('loadDeliveryAddressEdit error',error.message);
        }
    }




    const deliveryDeleteAddress = async(req,res)=>{
        try {
            
            const addressId = req.params.id
            const userId = req.session.user._id


            await UserData.findOneAndUpdate({
                _id:userId,
            },{$pull:{addressess:{_id:addressId}}},
        {new:true});


        res.redirect(`/checkout?success=Deleted Successfully`);


        } catch (error) {
            console.log('deliveryDeleteAddress error',error.message);
        }
    }







    const loadPlaceOrder = async(req,res)=>{
        try {
            console.log(req.body);

            res.render("placeOrder")
            
        } catch (error) {
            console.log('loadOrderMessage error',error.message);
        }
    }







    module.exports = {
        loadLandingpage,
        loadRegistration,
        loadLogin,
        insertUser,
        verifyLogin,
        verifyOtp,
        resendOtp,
        successGoogleLogin,
        failureGoogleLogin,
        forgotPassword,
        forgotVerify,
        resetPasswordLoad,
        VerifyResetPassword,
        loadWishlist,
        loadCart,
        loadUserHome,
        loadLogout,
        loadProductDetails,
        loadAccountDetails,
        verifyAccountDetails,
        loadAddressDetails,
        verifyAddress,
        loadAddressEdit,
        updateAddress,
        deleteAddress,
        verifyCart,
        deleteCartItems,
        verifyCheckout,
        loadDeliveryAddressEdit,
        deliveryDeleteAddress,
        loadPlaceOrder
    };
