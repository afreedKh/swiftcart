const User = require('../../models/userModel');

const userManagement = async (req,res)=>{
    try {
        const currentPage = parseInt(req.query.page) || 1;
        const search = req.query.search || '';
        const limit = 10; 
        const skip = (currentPage - 1) * limit;

        const searchQuery = search ? {
            $or: [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ]
        } : {};

        const totalUsers = await User.countDocuments({ ...searchQuery, is_admin: 0 });
        const totalPages = Math.ceil(totalUsers / limit);

        const users = await User.find({ ...searchQuery, is_admin: 0 }).skip(skip).limit(limit);

        res.render("userManagement", {
            users,
            currentPage,
            totalPages,
            baseUrl: "/admin/userManagement",
            search
        });
    }  catch (error) {
        console.log("userManagement error",error.message);
        return res.status(404).render("404");

    }
}





const blockUser = async(req,res)=>{
    try {
        if(req.session&&req.session.admin){
            delete req.session.user
        }
       
        await User.findByIdAndUpdate(req.params.id,{isBlocked:true})
        
      
        res.json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
        console.log("block user error",error.message);
        return res.status(404).render("404");

    }
}






const unblockUser = async(req,res)=>{
    try {

        await User.findByIdAndUpdate(req.params.id,{isBlocked:false})
        res.json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
        console.log("block user error",error.message);
        return res.status(404).render("404");

    }
}





module.exports={
    userManagement,
    blockUser,
    unblockUser
}