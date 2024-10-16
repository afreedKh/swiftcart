const Banner = require('../../models/bannerModel');
const bannerUpload = require('../../middlewares/bannerUploadMiddleware');




const loadBanner = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page number
        const limit = parseInt(req.query.limit) || 10; // Number of banners per page
        const skip = (page - 1) * limit; // Calculate how many banners to skip

        // Fetch banners with pagination
        const banners = await Banner.find().skip(skip).limit(limit);
        
        // Count total banners for pagination
        const totalBanners = await Banner.countDocuments();
        const totalPages = Math.ceil(totalBanners / limit); // Calculate total pages

        return res.render("adminBanner", { banners, page, totalPages,limit });
    } catch (error) {
        return res.status(404).render("404");
    }
};






const uploadBanner = async(req,res)=>{


    bannerUpload(req, res, async (err) => {
        if (err) {
            res.render('adminBanner', { message: err });
        } else {


            if (req.file == undefined||req.body===""||req.body.title===''||req.body.description===''||req.body.startDate===''||req.body.endDate===''||req.body.status==='') {
                return res.status(404).render("404");
            } else {


                const newBanner = new Banner({
                    image: req.file.filename,
                    title: req.body.title,
                    description: req.body.description,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    status: req.body.status
                });

                try {
                    await newBanner.save();
                    res.redirect('/admin/banner');
                } catch (error) {
                    return res.status(404).render("404");

                }
            }
        }
    });
}









const editBanner = async(req,res)=>{

    try {

        const banner = await Banner.findById(req.params.id);
        if(banner){
            res.render("adminEditBanner",{banner});
        }else{
            res.redirect("/admin/banner");
        }
        
    } catch (error) {
        console.log("edit Banner error",error.message);
        return res.status(404).render("404");

    }
}





const updateBanner = async (req, res) => {
    try {
        
        const { title, description, startDate, endDate, status } = req.body;
        let updateData = { title, description, startDate, endDate, status };

        if (req.file) {
            updateData.image = req.file.path; 
        }

      
        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true } 
        );
        if (updatedBanner) {
            res.redirect("/admin/banner");
        } else {
            res.redirect("/admin/banner");
        }

    } catch (error) {
        console.error("updateBanner error:", error.message);
        return res.status(404).render("404");
    }
};








const blockBanner = async(req,res)=>{
    try {
        await Banner.findByIdAndUpdate(req.params.id,{isDeleted:true})       
            res.json({ success: true, message: 'Banner deleted successfully' });
     
    } catch (error) {
        return res.status(404).render("404");
       
    }
}





const unblockBanner = async(req,res)=>{
    try {
        await Banner.findByIdAndUpdate(req.params.id,{isDeleted:false})       
            res.json({ success: true, message: 'Banner deleted successfully' });
     
    } catch (error) {
        return res.status(404).render("404");
    }
}





module.exports = {
    loadBanner,
    uploadBanner,
    editBanner,
    updateBanner,
    blockBanner,
    unblockBanner,
}