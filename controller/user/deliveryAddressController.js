const UserData = require("../../models/userModel");





const loadDeliveryAddressEdit = async(req,res)=>{
    try {

         const users = req.session.user||req.session.passport;
        const userId = users._id; 
        const addressId = req.params.id;

       
        const user = await UserData.findById(userId).populate('addressess'); 
        

        const address = user.addressess.id(addressId);
        if (!address) {
            return res.status(404).redirect('/404')
        }

        res.render("deliveryAddressEdit", { address, user });


        
    } catch (error) {
        console.log('loadDeliveryAddressEdit error',error.message);
        return res.status(404).redirect('/404')

    }
}




const deliveryDeleteAddress = async(req,res)=>{
    try {
        
        const addressId = req.params.id
        const users = req.session.user||req.session.passport;
        const userId = users._id


        await UserData.findOneAndUpdate({
            _id:userId,
        },{$pull:{addressess:{_id:addressId}}},
    {new:true});


    res.redirect(`/checkout?success=Deleted Successfully`);


    } catch (error) {
        console.log('deliveryDeleteAddress error',error.message);
        return res.status(404).redirect('/404')

    }
}









module.exports={
    loadDeliveryAddressEdit,
    deliveryDeleteAddress
}