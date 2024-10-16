const UserData = require("../../models/userModel");
const Cart = require("../../models/cartModel")


const loadAccountDetails = async(req,res)=>{
    try {
        const user = await  UserData.findById(req.params.id)

        const users = req.session.user||req.session.passport;
   
    let userss;

    if (users) {
      userss = await UserData.findById(users._id);
    }else {
      userss = null;
    }

    let cartCount = 0;
    let wishlistCount = 0;
    let cart = null;

    if (user) {
     
      cart = await Cart.findOne({ userId: userss._id });
      
      wishlistCount = userss.wishlist ? userss.wishlist.length : 0;
      cartCount = cart && cart.items ? cart.items.length : 0;
    }

      
       return res.render("account",{user,cartCount,wishlistCount})

    } catch (error) {
       

        console.log('loadAccount error',error.message);
        return res.status(404).redirect('/404')
    }
}






const verifyAccountDetails = async(req,res)=>{
    try {

        
        const user = req.params.id
        const email = req.body.email
        const name = req.body.name.trim()
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
        return res.status(404).redirect('/404')
        
    }
}




module.exports={
    loadAccountDetails,
    verifyAccountDetails
}