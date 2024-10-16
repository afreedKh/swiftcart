const Coupon = require("../../models/coupensModel");

const getAllCoupons = async (req, res) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const coupons = await Coupon.find({
            code: { $regex: search, $options: "i" }
        })
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1})

        const totalCoupons = await Coupon.countDocuments({
            code: { $regex: search, $options: "i" }
        });

        const totalPages = Math.ceil(totalCoupons / limit);

        res.render("adminCoupons", { 
            coupons, 
            search, 
            page, 
            limit, 
            totalPages 
        });
    } catch (error) {
        return res.status(404).render("404");

    }
};







const addCoupons = async (req, res) => {
    try {
        res.render("adminAddCoupons");
    } catch (error) {
        console.log('addCoupons error', error.message);
        return res.status(404).render("404");

    }
};











const uploadCoupons = async (req, res) => {
    try {
        const {
            code,
            discountValue,
            expiryDate,
            usageLimit,
            minPurchaseAmount,
        } = req.body;

        const codes = await Coupon.find({code:code})
        console.log(codes);
        

        if(codes.length>0){
            return res.status(400).json({message:'Code already exists'})
        }
        

        if (!code || !discountValue || !expiryDate || !usageLimit) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

       
        const couponCodeRegex = /^[A-Z0-9]{8}$/;
        if (!couponCodeRegex.test(code)) {
            return res.status(400).json({ message: 'Coupon code must be 8 uppercase letters or numbers.' });
        }

        
        if (isNaN(discountValue) || discountValue <= 0) {
            return res.status(400).json({ message: 'Discount value must be a positive number greater than zero.' });
        }

       
        const currentDate = new Date();
        const expiry = new Date(expiryDate);
        if (expiry <= currentDate) {
            return res.status(400).json({ message: 'Expiry date must be in the future.' });
        }

       
        if (isNaN(usageLimit) || usageLimit < 1) {
            return res.status(400).json({ message: 'Usage limit must be a positive number of at least 1.' });
        }

       
        if (isNaN(minPurchaseAmount) || minPurchaseAmount < 0) {
            return res.status(400).json({ message: 'Minimum purchase amount must be a non-negative number.' });
        }


        const newCoupon = new Coupon({
            code,
            discount: discountValue ,
            expiryDate: new Date(expiryDate),
            usageLimit: Number(usageLimit),
            minPurchaseAmount: Number(minPurchaseAmount),
        });

        await newCoupon.save();

        res.redirect('/admin/coupons?success=Coupon added successfully');
    } catch (error) {
        console.log('uploadCoupons error', error.message);
        return res.status(404).render("404");

    }
}












const editCoupons = async(req,res)=>{
    try {
        const id = req.params.id;  
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).render("404");

        }

        res.render('adminEditCoupons', { coupon });
    } catch (error) {
        console.error('editCoupons error:', error.message);
        return res.status(404).render("404");
    }
}




const updateCoupons = async (req, res) => {
    try {
      
        const {
            code,
            discount,
            expiryDate,
            usageLimit,
            minPurchaseAmount,
        } = req.body;
        const id = req.params.id; 

        const existingCoupon = await Coupon.findOne({ code: code, _id: { $ne: id } });

        console.log(existingCoupon);
        
        if(existingCoupon){
            console.log('hello');
            
            return res.status(400).json({ message: 'Coupon code already exists.' });
        }



        if (!code || !discount || !expiryDate || !usageLimit) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

       
        const couponCodeRegex = /^[A-Z0-9]{8}$/;
        if (!couponCodeRegex.test(code)) {
            return res.status(400).json({ message: 'Coupon code must be 8 uppercase letters or numbers.' });
        }

        
        if (isNaN(discount) || discount<= 0) {
            return res.status(400).json({ message: 'Discount value must be a positive number greater than zero.' });
        }

       
        const currentDate = new Date();
        const expiry = new Date(expiryDate);
        if (expiry <= currentDate) {
            return res.status(400).json({ message: 'Expiry date must be in the future.' });
        }

       
        if (isNaN(usageLimit) || usageLimit < 1) {
            return res.status(400).json({ message: 'Usage limit must be a positive number of at least 1.' });
        }

       
        if (isNaN(minPurchaseAmount) || minPurchaseAmount < 0) {
            return res.status(400).json({ message: 'Minimum purchase amount must be a non-negative number.' });
        }


        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).render("404");

        }

        coupon.code = code;
        coupon.discount = discount;
        coupon.expiryDate = new Date(expiryDate);
        coupon.usageLimit = Number(usageLimit);
        coupon.minPurchaseAmount = Number(minPurchaseAmount);

        await coupon.save();


        res.status(200).json({ message: 'Coupon updated successfully' });
    } catch (error) {
        console.error('updateCoupons error:', error.message);
        return res.status(404).render("404");

    }
};


const activateCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).render("404");

        }

        coupon.isActive = true;

        await coupon.save();

        res.status(200).json({ message: 'Coupon activated successfully' });
    } catch (error) {
        console.error('activateCoupon error:', error.message);
        return res.status(404).render("404");

    }
};




const deactivateCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).render("404");

        }

        coupon.isActive = false;

        await coupon.save();

        res.status(200).json({ message: 'Coupon deactivated successfully' });
    } catch (error) {
        console.error('deactivateCoupon error:', error.message);
        return res.status(404).render("404");

    }
};







module.exports={
    getAllCoupons,
    addCoupons,
    uploadCoupons,
    editCoupons,
    updateCoupons,
    activateCoupon,
    deactivateCoupon
}