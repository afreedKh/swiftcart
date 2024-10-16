const load404 = async(req,res)=>{
    try {
        return res.status(404).render("404")
    } catch (error) {
        console.log('404 page error',error.message);
       return res.status(404).redirect('/404')
    }
}



module.exports={
    load404
}