const UserData = require("../../models/userModel");
const Product = require("../../models/productModel");
const Cart = require("../../models/cartModel");
const Order = require("../../models/orderModel");
const crypto = require('crypto')
const https = require('https')



const loadPlaceOrder = async (req, res) => {
    try {
        const { selectedAddress, totalAmount, paymentMethod,discountAmount ,actualMrp,offerDiscount,subtotal} = req.body;
        
        
        const items = [];

        
        if (Array.isArray(req.body.items)) {
            req.body.items.forEach(item => {
                items.push({
                    productId: item.productId,
                    varientId: item.varientId,
                    productName: item.productName,
                    quantity: parseInt(item.quantity),
                    price: parseFloat(item.price),
                    total: parseFloat(item.total),
                    image: item.image
                });
            });
        } else {
            for (let i = 0; i < Object.keys(req.body).length; i++) {
                if (req.body[`items[${i}][productId]`]) {
                    items.push({
                        productId: req.body[`items[${i}][productId]`],
                        varientId: req.body[`items[${i}][varientId]`],
                        productName: req.body[`items[${i}][productName]`],
                        quantity: parseInt(req.body[`items[${i}][quantity]`]),
                        price: parseFloat(req.body[`items[${i}][price]`]),
                        total: parseFloat(req.body[`items[${i}][total]`]),
                        image: req.body[`items[${i}][image]`]
                    });
                } else {
                    break;
                }
            }
        }

        const users= req.session.user||req.session.passport;

        const user = await UserData.findById(users._id);
        if (!user) {
            return res.status(404).redirect('/404')
        }

        const address = user.addressess.id(selectedAddress);
        if (!address) {
            return res.status(404).redirect('/404')
        }
       

        const orderDetails = {
            userId: user._id,
            orderNumber: `ORD-${Date.now()}`,
            itemsOrdered: items,
            actualMrp,
            offerDiscount,
            subtotal,
            couponDiscount:discountAmount,
            totalAmount,
            shippingAddress: address,
            estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'Processing',
            paymentMethod
        };
        if (paymentMethod === 'wallet') {
            if (user.walletBalance < totalAmount) {
              return res.status(400).send('Insufficient wallet balance');
            }
      
            // Deduct amount from wallet
            user.walletBalance -= totalAmount;
            user.walletTransactions.push({
              type: 'debit',
              amount: totalAmount,
              description: `Payment for order ${orderDetails.orderNumber}`
            });
            await user.save();
      
            orderDetails.paymentMethod = 'Wallet';
      
            // Process the order (update stock, save order, clear cart)
            for (const item of items) {
              const product = await Product.findById(item.productId);
              const variant = product.varients.id(item.varientId);
      
              if (!variant || variant.stock < item.quantity) {
                return res.redirect("/productDetails/" + item.productId);
              }
      
              variant.stock -= item.quantity;
              await product.save();
            }
      
            const newOrder = new Order(orderDetails);
            await newOrder.save();
      
            await Cart.findOneAndUpdate({ userId: user._id }, { items: [] }, { new: true });
            req.session.orderPlaced = true;
      
            return res.redirect(`/orderSuccess?orderNumber=${newOrder.orderNumber}`);
          }
          
          
        if (paymentMethod === 'cod') {
            

            orderDetails.paymentMethod='Cash On Delivery'
            for (const item of items) {
                const product = await Product.findById(item.productId);
                const variant = product.varients.id(item.varientId);

                if (!variant || variant.stock < item.quantity) {
                   
                    
                    return res.redirect("/productDetails/" + item.productId);
                }

                variant.stock -= item.quantity;
                await product.save();
            }

            const newOrder = new Order(orderDetails);
            await newOrder.save();

            await Cart.findOneAndUpdate({ userId: user._id }, { items: [] }, { new: true });
            req.session.orderPlaced = true;

            return res.redirect(`/orderSuccess?orderNumber=${newOrder.orderNumber}`);
        } else if (paymentMethod === 'razorpay') {
            // For Razorpay, create a Razorpay order
            const razorpayOrder = await createRazorpayOrder(totalAmount);
            req.session.pendingOrder = orderDetails;

            return res.json({
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                keyId: process.env.RAZORPAY_KEY_ID
            });
        }
    } catch (error) {
        console.log('Error placing order:', error.message);
        return res.status(404).redirect('/404')

    }
};





const handleRazorpaySuccess = async (req, res) => {
    try {
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

        // Verify Razorpay payment signature
        const isSignatureValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

        if (!isSignatureValid) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        const orderDetails = req.session.pendingOrder;

        if (!orderDetails) {
            return res.status(400).json({ error: 'No pending order found' });
        }

        // Decrement stock only after successful payment
        for (const item of orderDetails.itemsOrdered) {
            const product = await Product.findById(item.productId);
            const variant = product.varients.id(item.varientId);

            if (!variant || variant.stock < item.quantity) {
                return res.redirect("/productDetails/" + item.productId);
            }

            variant.stock -= item.quantity;
            await product.save();
        }

        // Save the order
        const newOrder = new Order({
            ...orderDetails,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id
        });
        await newOrder.save();

        // Clear the cart
        await Cart.findOneAndUpdate({ userId: orderDetails.userId }, { items: [] }, { new: true });

        // Clear pending order from session
        delete req.session.pendingOrder;
        req.session.orderPlaced = true;

        // Respond with success
        res.json({ success: true, orderNumber: newOrder.orderNumber });
    } catch (error) {
        console.error('Error handling Razorpay success:', error);
        return res.status(404).redirect('/404')

    }
};





function verifyRazorpaySignature(orderId, paymentId, signature) {
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');
    return generated_signature === signature;
}











const createRazorpayOrder = (amount) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.razorpay.com',
        port: 443,
        path: '/v1/orders',
        method: 'POST',
        auth: `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };
  
      const req = https.request(options, (res) => {
        let data = '';
  
        res.on('data', (chunk) => {
          data += chunk;
        });
  
        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      }).on('error', (error) => {
        reject(error);
      });
  
      req.write(JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        payment_capture: 1
      }));
  
      req.end();
    });
  };







  const razorpayWebhook = (req, res) => {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    const receivedSignature = req.headers['x-razorpay-signature'];
  
    shasum.update(JSON.stringify(req.body));
    const generatedSignature = shasum.digest('hex');
  
    if (generatedSignature === receivedSignature) {
      console.log('Webhook verified');
      // Process the webhook payload
      // ...
      res.json({ status: 'ok' });
    } else {
      console.log('Invalid webhook signature');
      res.status(400).json({ error: 'Invalid signature' });
    }
  };









const loadOrderSuccessPage = async (req, res) => {
    try {
        const { orderNumber } = req.query;

        const order = await Order.findOne({ orderNumber });

        if (!order) {
            return res.status(404).redirect('/404')
        }

        res.render('placeOrder', { orderDetails: order });
    } catch (error) {
        console.log('Error loading order success page:', error.message);
        return res.status(404).redirect('/404')

    }
};




const loadOrderFailure = async (req, res) => {
    try {
        const pendingOrder = req.session.pendingOrder;
       
        
        if (!pendingOrder) {
            return res.redirect('/');
        }

        
        const newOrder = new Order({
            ...pendingOrder,
            status: 'Pending'
        });
        await newOrder.save();
       
        
        
        await Cart.findOneAndUpdate({ userId: pendingOrder.userId }, { items: [] }, { new: true });
      
        delete req.session.pendingOrder;
        req.session.orderPlaced = true;
        res.render('orderFailure', { orderDetails: newOrder });
    } catch (error) {
        console.error('Error handling order failure:', error);
        return res.status(404).redirect('/404')

    }
};








const retryOrderFailure = async (req, res) => {
    try {
        const pendingOrder = req.session.pendingOrder;
       

        
        if (!pendingOrder) {
            return res.redirect('/');
        }

        
       
        const {orderNumber} = req.query;

        const orderDetails= await Order.findOne({orderNumber})
        
       
      
        delete req.session.pendingOrder;
        req.session.orderPlaced = true;
        res.render('orderFailure', { orderDetails });
    } catch (error) {
        console.error('Error handling order failure:', error);
        return res.status(404).redirect('/404')

    }
};












const retryOrderSuccess = async(req,res)=>{
    try {

        const { orderNumber } = req.query;

        const order = await Order.findOne({ orderNumber });
        
        

        if (!order) {
            return res.status(404).redirect('/404')
        }

        for (const item of order.itemsOrdered) {
            const product = await Product.findById(item.productId);
            const variant = product.varients.id(item.varientId);

            if (!variant || variant.stock < item.quantity) {
                return res.redirect("/productDetails/" + item.productId);
            }

            variant.stock -= item.quantity;
            await product.save();
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { orderNumber },  
            { status: 'Processing' },  
            { new: true }  
        );

        res.render('placeOrder', { orderDetails: updatedOrder });
        
    } catch (error) {
        console.log('retry order success error',error.message);
        return res.status(404).redirect('/404')

    }
}




const loadOrders = async (req, res) => {
    try {
        const user = await UserData.findById(req.params.id);

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

       
        const page = parseInt(req.query.page) || 1;

      
        const limit = 5; 

       
        const totalOrders = await Order.countDocuments({ userId: req.params.id });
        const totalPages = Math.ceil(totalOrders / limit);

        
        const skip = (page - 1) * limit;

       
        const orders = await Order.find({ userId: req.params.id })
                                  .sort({ createdAt: -1 })
                                  .skip(skip)
                                  .limit(limit);

        
        res.render("orders", {
            orders,
            user,
            currentPage: page,
            totalPages,
            limit,
            wishlistCount,
            cartCount
        });

    } catch (error) {
        console.log('loadOrder error', error.message);
        return res.status(404).redirect('/404')

    }
};











const loadOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'itemsOrdered.productId',
                select: 'name images varients',
            })
            .lean(); 

        if (!order) {
            return res.status(404).redirect('/404')
        }

        order.itemsOrdered = order.itemsOrdered.map(item => {
            if (item.productId) {
                item.productId.images = item.productId.images || [];
                item.productId.varients = item.productId.varients || [];
            } else {
                item.productId = { name: 'Unknown Product', images: [], varients: [] };
            }

            if (item.productId.varients.length > 0) {
                item.varient = item.productId.varients.find(v => v._id.toString() === item.varientId.toString());
            }

            return item;
        });


        res.render("orderDetails", { order });
    } catch (error) {
        console.log('loadOrderDetails error', error.message);
        return res.status(404).redirect('/404')

    }
};








const cancelOrder = async(req,res)=>{
    try {

        const orderId = req.params.id;
        const orders = await Order.findById(orderId);



        if (!orders) {
            return res.status(404).redirect('/404')
        }

        if (orders.paymentMethod === 'razorpay' || orders.paymentMethod === 'Wallet'||(orders.paymentMethod === 'cod' && orders.status === 'Delivered')) {
            const user = await UserData.findById(orders.userId);
            user.walletBalance += orders.totalAmount;
            user.walletTransactions.push({
              type: 'credit',
              amount: orders.totalAmount,
              description: `Refund for Cancelled order ${orders.orderNumber}`
            });
            await user.save();
          }
      

        for (const item of orders.itemsOrdered) {
            const product = await Product.findById(item.productId);

            if (product) {
                const variant = product.varients.id(item.varientId);
 
                if (variant) {
                    variant.stock += item.quantity;
                    await product.save(); 
                }
            }
        }





        const order = await Order.findByIdAndUpdate(orderId,{status:'Cancelled'},{new:true});

        if (!order) {
            return res.status(404).redirect('/404')
        }

       res.redirect(`/orderDetails/${orderId}`);
        
    } catch (error) {
        console.log('cancelOrder error',error.message);
        return res.status(404).redirect('/404')

    }
}


const retryPayment= async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order || order.status !== 'Pending') {
            return res.status(400).json({ error: 'Invalid order' });
        }

        const razorpayOrder = await createRazorpayOrder(order.totalAmount);
        req.session.pendingOrder = order;

        res.json({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            orderNumber: order.orderNumber
        });
    } catch (error) {
        console.error('Error retrying payment:', error);
        return res.status(404).redirect('/404')

    }
}








const returnOrder = async (req, res) => {
    const orderId = req.params.id;

    try {
        let order = await Order.findById(orderId);
        const { reason, message } = req.body;
        if (!order) {
            return res.status(404).redirect('/404')
        }
        
        if (order.status !== 'Delivered') {
            return res.status(404).redirect('/404')
        }

        order.status = 'Return-Requested';
        order.returnReason.push({ reason, message });

        await order.save();


       res.redirect(`/orderDetails/${orderId}`);
    } catch (error) {
        console.error('Error processing return order:', error);
        return res.status(404).redirect('/404')

    }
};





module.exports={
    loadPlaceOrder,
    loadOrderDetails,
    loadOrderSuccessPage,
    loadOrders,
    cancelOrder,
    razorpayWebhook,
    handleRazorpaySuccess,
    returnOrder,
    loadOrderFailure,
    retryPayment,
    retryOrderSuccess,
    retryOrderFailure
}