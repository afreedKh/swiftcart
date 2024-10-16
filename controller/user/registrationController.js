const UserData = require('../../models/userModel');
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const dotenv = require("dotenv").config();
const randomstring = require("randomstring");








const securePassword= async(password)=>{
    try {
    const sPassword = await bcrypt.hash(password,10);
    return sPassword;

    } catch (error) {
       
        console.log('Password security error',error.message);
        return res.status(404).redirect('/404')
    }
}







const generateOtp = ()=>{
    return Math.floor(1000+Math.random()*9000);
}








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
        return res.status(404).redirect('/404')

       
    }
};









const resendOtp = async (req, res) => {
    try {
        const otp = generateOtp();  
        req.session.userOtp = otp;  

        const email = req.session.userDatas.email; 
        const emailSent = await sendVerificationEmail(email, otp); 

        if (emailSent) {
            res.json({ success: true, message: "OTP resent successfully" });
        } else {
            res.status(500).json({ success: false, message: "Failed to resend OTP" });
        }
    } catch (error) {
        console.log("Resend OTP error", error.message);
       
        return res.status(404).redirect('/404')
    }
};










const successGoogleLogin = (req,res)=>{
    req.session.passport = req.user;
    res.redirect("/home")

}

const failureGoogleLogin = (req,res)=>{
    res.send("error")
}







const forgotPassword = async(req,res)=>{
    try {

        res.render("forgotPassword")
        
    } catch (error) {
        console.log('Forgott password logic error',error.message);
        return res.status(404).redirect('/404')

    }
}







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
        return res.status(404).redirect('/404')

    }
}





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
        return res.status(404).redirect('/404')

    }
}









const VerifyResetPassword = async(req,res)=>{
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;

        const securepassword = await securePassword(password)
        await UserData.findByIdAndUpdate({_id:user_id},{$set:{password:securepassword,token:''}})
        res.redirect("/login");
    } catch (error) {
        console.log("verify reset password error", error.message);
        return res.status(404).redirect('/404')

    }
}








const loadRegistration = async(req,res)=>{
    try {
        res.render("registration");
    } catch (error) {
        console.log('LoadRegistration page error ',error.message);
        return res.status(404).redirect('/404')
    }
}





const insertUser =async(req,res)=>{
    try {

        const {email,phone,password,confirmPassword}=req.body;

        const name = req.body.name.trim();
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
        return res.status(404).redirect('/404')
        
    }
}









module.exports={
    loadRegistration,
    insertUser,
    verifyOtp,
    resendOtp,
    successGoogleLogin,
    failureGoogleLogin,
    forgotPassword,
    forgotVerify,
    resetPasswordLoad,
    VerifyResetPassword,    
}