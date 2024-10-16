const User = require("../../models/userModel");
const bcrypt = require("bcrypt")


const loadLogin = async(req,res)=>{
    try {
        res.render("login")
        
    } catch (error) {

        console.log("admin login page load error",error.message);
        return res.status(404).render("404");

    }
}









const verifyLogin = async(req,res)=>{

    try {

        const {email,password}=req.body;

        const validateEmail = (email) => {
            return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        };


        const validationErrors = {};

        if (!validateEmail(email||email==="")) {
            validationErrors.invalidEmail = "Invalid email ";
        }

        if (Object.keys(validationErrors).length > 0) {
            return res.render('login',  validationErrors );
        }
        
        const userData =await User.findOne({email});
        if(userData){
           
           const passwordMatch= await bcrypt.compare(password,userData.password);
           if(passwordMatch){
            if(userData.is_admin===0){
               
                res.render('login',{message:"Email and password is incorrect"});
            }else{

                req.session.admin=userData;
                
                res.redirect('/admin/dashboard')
            }
           }else{
            
            res.render('login',{message:"Email and password is incorrect"});
           }
        }else{
           
            res.render('login',{message:"Email and password is incorrect"});
        }

        
    } catch (error) {
        console.log("verify login error ",error.message);
        return res.status(404).render("404");

    }
}









module.exports={
    loadLogin,
    verifyLogin,
}