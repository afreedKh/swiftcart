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
        return res.status(404).redirect('/404')
    }
}



module.exports={
    loadLogout
}