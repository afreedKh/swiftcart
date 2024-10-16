
const Order = require("../../models/orderModel")
const Product = require("../../models/productModel");
const User = require("../../models/userModel")

const loadOrders = async (req, res) => {
    try {
        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = 10;
        const searchQuery = req.query.search || '';


        const totalOrders = await Order.countDocuments({
            $or: [
                { orderNumber: { $regex: searchQuery, $options: 'i' } },
                { 'shippingAddress.name': { $regex: searchQuery, $options: 'i' } }
            ]
        });


        const totalPages = Math.ceil(totalOrders / itemsPerPage);

        const orders = await Order.find({
            $or: [
                { orderNumber: { $regex: searchQuery, $options: 'i' } },
                { 'shippingAddress.name': { $regex: searchQuery, $options: 'i' } }
            ]
        })
        .skip((currentPage - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .sort({ createdAt: -1 });

        res.render("adminOrders", {
            orders,
            currentPage,
            totalPages,
            searchQuery
        });
    } catch (error) {
        console.log('loadOrders error', error.message);
        return res.status(404).render("404");

    }
};









const loadOrderDetails = async(req,res)=>{
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'itemsOrdered.productId',
                select: 'name images varients',
            })
            .lean(); 

        if (!order) {
            return res.status(404).render("404");

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


        res.render("adminOrderDetails", { order });
    } catch (error) {
        console.log('loadOrderDetails error', error.message);
        return res.status(404).render("404");

    }
}






const cancelOrder = async(req,res)=>{
    try {
        
        const orderId = req.params.id;
        const orders = await Order.findById(orderId);



            if (!orders) {
                return res.status(404).render("404");

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

            if (orders.paymentMethod === 'razorpay'||orders.paymentMethod==='Wallet') {
                const user = await User.findById(orders.userId);
                user.walletBalance += orders.totalAmount;
                user.walletTransactions.push({
                  type: 'credit',
                  amount: orders.totalAmount,
                  description: `Refund for Cancelled order ${orders.orderNumber}`
                });
                await user.save();
              }


        const order = await Order.findByIdAndUpdate(orderId, { status: 'Cancelled' }, { new: true });

        if (!order) {
            return res.status(404).render("404");

        }

        res.redirect(`/admin/orders/${orderId}`);


    } catch (error) {
        console.log('cancelOrder error', error.message);
        return res.status(404).render("404");

    }
}










const updateOrderStatus = async(req,res)=>{
    try {
        
        const orderId = req.params.id;
        const status = req.body.status;
        const order = await Order.findByIdAndUpdate(orderId, { status: status }, { new: true });

        if (!order) {
            return res.status(404).render("404");

        }

        res.redirect(`/admin/orders/${orderId}`);



    } catch (error) {
        console.log('updateOrderStatus error',error.message);
        return res.status(404).render("404");

    }
}








const approveReturn = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).render("404");

        }

        if (order.status !== 'Return-Requested') {
            return res.status(400).json({ message: 'Return request is not in the correct status' });
        }

        const user = await User.findById(order.userId);
        user.walletBalance += order.totalAmount;
        user.walletTransactions.push({
        type: 'credit',
        amount: order.totalAmount,
        description: `Refund for returned order ${order.orderNumber}`
    });
         await user.save();

        // Update the order status
        order.status = 'Returned';



        // Increment stock for each product variant
        for (const item of order.itemsOrdered) {
            const product = await Product.findById(item.productId);
            if (product) {
                const variant = product.varients.id(item.varientId);
                if (variant) {
                    variant.stock += item.quantity;
                    await product.save();
                }
            }
        }

        await order.save();
        res.redirect(`/admin/orders/${req.params.id}`);
    } catch (error) {
        return res.status(404).render("404");

    }
};





const cancelReturn = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).render("404");

        }

        if (order.status !== 'Return-Requested') {
            return res.status(400).json({ message: 'Return request is not in the correct status' });
        }

        // Update the order status
        order.status = 'Return-Cancelled'; 

        await order.save();
        res.redirect(`/admin/orders/${req.params.id}`);
    } catch (error) {
        return res.status(404).render("404");

    }
};




module.exports={
    loadOrders,
    loadOrderDetails,
    cancelOrder,
    updateOrderStatus,
    approveReturn,
    cancelReturn
}