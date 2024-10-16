const UserData = require("../../models/userModel");
const bcrypt = require('bcrypt');


const loadLogin = async(req,res)=>{
    try {
        res.render("login");
    } catch (error) {
        console.log('loadLogin page error ',error.message);
        return res.status(404).redirect('/404')

    }
}






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
        return res.status(404).redirect('/404')

    }
}






module.exports={
    loadLogin,
    verifyLogin
}