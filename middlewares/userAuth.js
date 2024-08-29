const isLogin = async (req,res,next)=>{
    try {
        const user = req.session.user
        const passport = req.session.passport

        if(user||passport){
            next();
        }else{
            res.redirect('/');
        }
    } catch (error) {
        console.log("Islogin middleware error",error.message);
    }
}






const isLogout = async (req,res,next)=>{
   try {
    const user = req.session.user
    const passport = req.session.passport
    if(user||passport){
        res.redirect('/home');
    }else{
        next();
    }
   } catch (error) {
    console.log("islogout middleware error ",error.message);
   }
}



module.exports={
    isLogin,
    isLogout
}