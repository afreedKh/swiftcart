const UserData = require("../../models/userModel");
const Product = require("../../models/productModel");




const loadCheckout = async(req,res)=>{
    try {
        if (req.session.orderPlaced) {
            res.redirect('/cart');
        } else {
           
            const users = req.session.user||req.session.passport;

        const user = await UserData.findById(users)
        user.addressess.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

       const {   
        items,
        actualMrp,           
        offerDiscount,        
        couponDiscount,       
        subtotal,             
        total  }=req.session.checkoutData;
       

       


       if (!user || !items || !subtotal) {        
        return res.redirect('/cart'); 
        }

        const codAllowed = total <= 1000;

        res.render('checkout', { 
            user, 
            items,
            actualMrp,          
            offerDiscount,      
            couponDiscount,     
            subtotal,           
            total,
            codAllowed,
            walletBalance: user.walletBalance 
          });
    }
    } catch (error) {
        

        console.log('loadCheckout error',error.message);
        return res.status(404).redirect('/404')
    }
}











const verifyCheckout = async (req, res) => {
    try {
        const itemsObject = req.body.items;

        let actualMrp = 0; 
        let offerDiscount = 0; 
        let couponDiscount = 0; 
        const shippingCharge = 100;

        
        const items = await Promise.all(Object.values(itemsObject).map(async (item) => {
            const product = await Product.findById(item.productId).populate('offer');
            const variant = product.varients.find(v => v._id.toString() === item.varientId);

            const originalPrice = product.price; 
            let price = originalPrice; 

            
            if (product.offer && 
                product.offer.isActive && 
                new Date() >= new Date(product.offer.startDate) && 
                new Date() <= new Date(product.offer.endDate)) {
                const discountAmount = originalPrice * (product.offer.discount / 100);
                price = originalPrice - discountAmount;
                offerDiscount += discountAmount * item.quantity; 
            }

            const itemTotal = price * item.quantity;
            actualMrp += originalPrice * item.quantity; 

            return {
                ...item,
                product: product,
                variant: variant,
                price: price,
                itemTotal: itemTotal
            };
        }));

        
        const subtotal = actualMrp - offerDiscount - couponDiscount; 
        let total = subtotal;

        if (total < 1000) {
            total += shippingCharge;
        }
        
        req.session.checkoutData = {
            items,
            actualMrp,           
            offerDiscount,       
            couponDiscount,      
            subtotal,            
            total,
            shippingCharge: total < 1000 ? shippingCharge : 0 
        };

        req.session.orderPlaced = false;
        res.redirect("/checkout");
        
    } catch (error) {
        console.log('verifyCheckout error:', error.message);
        return res.status(404).redirect('/404')

    }
}








module.exports={
    verifyCheckout,
    loadCheckout
}