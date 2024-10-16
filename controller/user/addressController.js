const UserData = require("../../models/userModel");
const Cart = require("../../models/cartModel")


const loadAddressDetails = async (req, res) => {
    try {
        const user = await UserData.findById(req.params.id);
        if (!user || !user.addressess) {
            return res.status(404).redirect('/404')
        }

        const users = req.session.user||req.session.passport;
   
        let userss;

        if (users) {
        userss = await UserData.findById(users._id);
        }else {
        userss = null;
        }

        let cartCount = 0;
        let wishlistCount = 0;
        let cart = null;

        if (userss) {
        
        cart = await Cart.findOne({ userId: userss._id });
        
        wishlistCount = userss.wishlist ? userss.wishlist.length : 0;
        cartCount = cart && cart.items ? cart.items.length : 0;
        }

       
        user.addressess.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const page = parseInt(req.query.page) || 1; 
        const limit = 5; 

        const totalAddresses = user.addressess.length; 
        const totalPages = Math.ceil(totalAddresses / limit); 

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit; 

        const currentAddresses = user.addressess.slice(startIndex, endIndex); 

        res.render("address", {
            user,
            addresses: currentAddresses,
            currentPage: page,
            totalPages,
            limit,
            wishlistCount,
            cartCount
        });

    } catch (error) {
        

        console.log('loadAddressDetails error', error.message);
        return res.status(404).redirect('/404')
        
    }
};






const verifyAddress = async(req,res)=>{
    try { 
         
        const user = await UserData.findById(req.params.id)

        const {phone,pincode,locality,address,city,landmark,alternatePhone,addressType}=req.body

        const name = req.body.name.trim();
        const state = req.body.state.trim();

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



        if (!validateName(name)||name==="") {
           
            validationErrors.invalidName = "Invalid name";
         }

         if (!validatePhone(phone)||phone==="") {
            
             validationErrors.invalidPhone = "Enter valid mobile";
        }

        if(pincode<6||pincode===''||!/^\d{6}$/.test(pincode)){

            validationErrors.invalidPincode = "Enter valid pincode"
        }

        if (!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(locality)) {
            validationErrors.invalidLocality = "Locality should be 3 characters long ";
        }

        if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(address)){
            validationErrors.invalidAddress = "Address(Area and Street) should be 3 characters long";
        }

        if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(city)){
            validationErrors.invalidCity = "City/District/Town should be 3 characters long";
        }

        if (!validateName(state)||state==="") {
           
            validationErrors.invalidState = "Invalid state";
        }

        if(landmark){
            if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(landmark)){
                validationErrors.invalidLandmark = "Landmark should be 3 characters long";
            }
        }

        if(alternatePhone){
            if (!validatePhone(alternatePhone)||alternatePhone==="") {
            
                validationErrors.invalidAlternatePhone = "Enter valid mobile";
           }
        }


        if(Object.keys(validationErrors).length>0){
            res.json({success:false,errors:validationErrors});
        }else{

         

        await user.addressess.push(req.body);

        await user.save();
       
        res.json({success:true,message:"New address added successfully"})

     }
    } catch (error) {
        console.log('verifyAddress error',error.message);
        return res.status(404).redirect('/404')
    }
}





const loadAddressEdit = async (req, res) => {
    try {

        const users = req.session.user||req.session.passport;
        const userId = users._id; 
        const addressId = req.params.id;

       
        const user = await UserData.findById(userId).populate('addressess'); 
        

        const address = user.addressess.id(addressId);
        if (!address) {
            return res.status(404).redirect('/404')
        }

        res.render("editAddress", { address, user });

    } catch (error) {
        console.log('loadAddressEdit error', error.message);
        return res.status(404).redirect('/404')

    }
}





const updateAddress = async(req,res)=>{
    try {

        const addressId = req.params.id;
        const user = req.session.user||req.session.passport;
        const userId = user._id
        

        const {phone,pincode,locality,address,city,landmark,alternatePhone,addressType}=req.body

        const name = req.body.name.trim();
        const state = req.body.state.trim();
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



        if (!validateName(name)||name==="") {
           
            validationErrors.invalidName = "Invalid name";
         }

         if (!validatePhone(phone)||phone==="") {
            
             validationErrors.invalidPhone = "Enter valid mobile";
        }

        if(pincode<6||pincode===''||!/^\d{6}$/.test(pincode)){

            validationErrors.invalidPincode = "Enter valid pincode"
        }

        if (!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(locality)) {
            validationErrors.invalidLocality = "Locality should be 3 characters long ";
        }

        if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(address)){
            validationErrors.invalidAddress = "Address(Area and Street) should be 3 characters long";
        }

        if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(city)){
            validationErrors.invalidCity = "City/District/Town should be 3 characters long";
        }

        if (!validateName(state)||state==="") {
           
            validationErrors.invalidState = "Invalid state";
        }

        if(landmark){
            if(!/^[A-Za-z0-9\s\-.,]{3,100}$/.test(landmark)){
                validationErrors.invalidLandmark = "Landmark should be 3 characters long";
            }
        }

        if(alternatePhone){
            if (!validatePhone(alternatePhone)||alternatePhone==="") {
            
                validationErrors.invalidAlternatePhone = "Enter valid mobile";
           }
        }


        if(Object.keys(validationErrors).length>0){
            res.json({success:false,errors:validationErrors});
        }else{

         

      

       const updateAddress = await UserData.findOneAndUpdate({
        _id:userId,
        'addressess._id' :addressId
       },{
        $set:{
            'addressess.$.name': name,
            'addressess.$.phone': phone,
            'addressess.$.pincode': pincode,
            'addressess.$.locality': locality,
            'addressess.$.address': address,
            'addressess.$.city': city,
            'addressess.$.state': state,
            'addressess.$.landmark': landmark,
            'addressess.$.alternatePhone': alternatePhone,
            'addressess.$.addressType': addressType
        }
       },{new:true})

       

       await updateAddress.save()
        
            
        res.json({success:true,message:"New address added successfully"})

     }
        

    } catch (error) {
        console.log('updateAddress error',error.message);
        return res.status(404).redirect('/404')

    }
}







const deleteAddress = async(req,res)=>{
    try {

        const addressId = req.params.id
        const user=req.session.user||req.session.passport;
        const userId = user._id


        await UserData.findOneAndUpdate({
            _id:userId,
        },{$pull:{addressess:{_id:addressId}}},
    {new:true});


    res.redirect(`/address/${userId}?success=Deleted Successfully`);


    } catch (error) {
        console.log('deleteAddress error',error.message);
        return res.status(404).redirect('/404')
    }
}





module.exports={
    loadAddressDetails,
    verifyAddress,
    loadAddressEdit,
    updateAddress,
    deleteAddress,

}