
const loadAbout = async(req,res)=>{
    try {

        res.render("about")
        
    } catch (error) {
    
        console.log('about page error',error.message);
        return res.status(404).redirect('/404')
        
    }
}


module.exports={
    loadAbout

}