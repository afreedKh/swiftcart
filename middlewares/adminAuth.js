const isLogin = async(req,res,next)=>{
    try {
        const admin = req.session.admin;
        if(admin){
           next(); 
        }else{
            res.redirect('/admin/admin');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        const admin = req.session.admin;
       if(admin){
        res.redirect('/admin/dashboard')
       } else{
            next();
       }

    } catch (error) {
        console.log(error.message);
    }
}

module.exports={
    isLogin,
    isLogout
}