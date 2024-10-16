
const Coupon = require('../../models/coupensModel'); 

const loadCoupons =  async (req, res) => {
    try {
        const coupons = await Coupon.find({ isActive: true, expiryDate: { $gte: new Date() } });
        res.json(coupons);
    } catch (error) {
        return res.status(404).redirect('/404')

    }
}








const validateCoupon = async (req, res) => {
    
    try {

        const { code, totalAmount,subtotal } = req.body;
      
        
        const coupon = await Coupon.findOne({ 
            code, 
            isActive: true, 
            expiryDate: { $gte: new Date() },
            $expr: { $lt: ["$usedCount", "$usageLimit"] }   
        });

        if (!coupon) {
            return res.status(400).json({ message: 'Invalid or expired coupon' });
        }

        if (subtotal < coupon.minPurchaseAmount) {
            return res.status(400).json({ message: `Minimum purchase amount is Rs.${coupon.minPurchaseAmount}` });
        }

        const discountAmount = (subtotal * coupon.discount) / 100;        
        const newTotal = subtotal - discountAmount;

        coupon.usedCount += 1;
        await coupon.save();

        res.json({
            message: 'Coupon applied successfully',
            discountAmount,
            newTotal,
            couponCode: coupon.code
        });
    } catch (error) {
        
        return res.status(404).redirect('/404')

    }
}









const removeCoupon = async (req, res) => {
    try {
        
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code });
        if (coupon) {
            coupon.usedCount = Math.max(0, coupon.usedCount - 1);
            await coupon.save();
        }

        res.json({
            message: 'Coupon removed successfully',
            discountAmount: 0,
        });
    } catch (error) {
        return res.status(404).redirect('/404')

    }
};

module.exports = {
    loadCoupons,
    validateCoupon,
    removeCoupon,
};







