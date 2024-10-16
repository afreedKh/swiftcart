const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");
const Category = require("../../models/categoryModel"); 
const Brand = require("../../models/brandModel"); 


const loadDashboard = async (req, res) => {
    try {
        const totalRevenue = await calculateTotalRevenue();
        const topProducts = await getTopProducts(5); 
        const recentSales = await getRecentSales();
        const bestSellingProducts = await getBestSellingProducts(10);
        const bestSellingCategories = await getBestSellingCategories(10);
        const bestSellingBrands = await getBestSellingBrands(10);
       


        res.render("adminDashboard", {
            totalRevenue,
            topProducts,
            recentSales,
            bestSellingProducts,
            bestSellingCategories,
            bestSellingBrands,
            getStatusColor,
            
        });
    } catch (error) {
        console.log("Load dashboard error", error.message);
        return res.status(404).render("404");

    }
};







const generateSalesReport = async (req, res) => {
    try {
        const { reportType, startDate, endDate } = req.body;
        let query = {};
        let start, end;

        switch (reportType) {
            case 'daily':
                start = new Date();
                start.setDate(1); // First day of the current month
                end = new Date();
                break;
            case 'weekly':
                start = new Date();
                start.setDate(start.getDate() - start.getDay()); // Last Sunday
                end = new Date();
                break;
            case 'monthly':
                start = new Date();
                start.setDate(1); // First day of the current month
                end = new Date(start.getFullYear(), start.getMonth() + 1, 0); // Last day of the current month
                break;
            case 'yearly':
                start = new Date(new Date().getFullYear(), 0, 1); // January 1st of current year
                end = new Date();
                break;
            case 'custom':
                start = new Date(startDate);
                end = new Date(endDate);
                break;
        }

        query.createdAt = { $gte: start, $lte: end };

        const orders = await Order.find(query);

        let labels, salesData;

        switch (reportType) {
            case 'daily':
                ({ labels, salesData } = getDailyData(orders, start, end));
                break;
            case 'weekly':
                ({ labels, salesData } = getWeeklyData(orders, start, end));
                break;
            case 'monthly':
                ({ labels, salesData } = getMonthlyData(orders, start, end));
                break;
            case 'yearly':
                ({ labels, salesData } = getYearlyData(orders, start, end));
                break;
            case 'custom':
                ({ labels, salesData } = getCustomData(orders, start, end));
                break;
        }
        const totalSales = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalCouponDiscount = orders.reduce((sum, order) => sum + (order.couponDiscount || 0), 0);
        const totalOfferDiscount = orders.reduce((sum, order) => sum + (order.offerDiscount || 0), 0);
        const totalDiscount = totalCouponDiscount + totalOfferDiscount;

      

        const monthlyRevenue = await calculateMonthlyRevenue(start, end);

        const reportHtml = `
            <h3>Sales Report</h3>
            <p>Total Sales: ${totalSales}</p>
            <p>Total Revenue: ₹${totalRevenue.toFixed(2)}</p>
            <p>Total Coupon Discount: ₹${totalCouponDiscount.toFixed(2)}</p>
            <p>Total Offer Discount: ₹${totalOfferDiscount.toFixed(2)}</p>
            <p>Total Discount: ₹${totalDiscount.toFixed(2)}</p>
        `;

        const reportData = orders.map(order => ({
            orderId: order._id.toString(),
            customer: order.userId ? order.shippingAddress.name : 'Unknown',
            totalAmount: order.totalAmount.toFixed(2),
            date: order.createdAt.toLocaleDateString(),
            status: order.status,
            paymentMethod: order.paymentMethod,
            couponDiscount: (order.couponDiscount || 0).toFixed(2),
            offerDiscount: (order.offerDiscount || 0).toFixed(2),
            items: order.itemsOrdered.map(item => ({
                name: item.productName,
                quantity: item.quantity
            }))
        }));

        res.json({
            html: reportHtml,
            data: reportData,
            labels: labels,
            salesData: salesData,
            totalRevenue: totalRevenue.toFixed(2),
            totalSales,
            totalDiscount:totalDiscount.toFixed(2)
        });
    } catch (error) {
        console.log("Generate sales report error", error.message);
        return res.status(404).render("404");

    }
};




function getDailyData(orders, start, end) {
    const days = (end - start) / (1000 * 60 * 60 * 24) + 1;
    const labels = Array.from({length: days}, (_, i) => i + 1);
    const salesData = new Array(days).fill(0);

    orders.forEach(order => {
        const dayIndex = Math.floor((order.createdAt - start) / (1000 * 60 * 60 * 24));
        salesData[dayIndex] += order.totalAmount;
    });

    return { labels, salesData };
}





function getWeeklyData(orders, start, end) {
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesData = new Array(7).fill(0);

    orders.forEach(order => {
        const dayIndex = order.createdAt.getDay();
        salesData[dayIndex] += order.totalAmount;
    });

    return { labels, salesData };
}





function getMonthlyData(orders, start, end) {
    const labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const salesData = new Array(4).fill(0);

    orders.forEach(order => {
        const weekIndex = Math.floor((order.createdAt.getDate() - 1) / 7);
        salesData[weekIndex] += order.totalAmount;
    });

    return { labels, salesData };
}







function getYearlyData(orders, start, end) {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const salesData = new Array(12).fill(0);

    orders.forEach(order => {
        const monthIndex = order.createdAt.getMonth();
        salesData[monthIndex] += order.totalAmount;
    });

    return { labels, salesData };
}







function getCustomData(orders, start, end) {
    const days = (end - start) / (1000 * 60 * 60 * 24) + 1;
    const labels = Array.from({length: days}, (_, i) => {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        return date.toLocaleDateString();
    });
    const salesData = new Array(days).fill(0);

    orders.forEach(order => {
        const dayIndex = Math.floor((order.createdAt - start) / (1000 * 60 * 60 * 24));
        salesData[dayIndex] += order.totalAmount;
    });

    return { labels, salesData };
}





async function calculateMonthlyRevenue(start, end) {
    const monthlyRevenue = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lte: end }
            }
        },
        {
            $group: {
                _id: { $month: "$createdAt" },
                revenue: { $sum: "$totalAmount" }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    const fullMonthlyRevenue = Array(12).fill(0);
    monthlyRevenue.forEach(month => {
        fullMonthlyRevenue[month._id - 1] = month.revenue;
    });

    return fullMonthlyRevenue;
}










async function calculateTotalRevenue() {
    const result = await Order.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]);
    return result[0]?.totalRevenue || 0;
}



async function getTopProducts(limit = 5) {
    const topProducts = await Order.aggregate([
        { $unwind: "$itemsOrdered" },
        {
            $group: {
                _id: "$itemsOrdered.productId",
                totalSold: { $sum: "$itemsOrdered.quantity" }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        {
            $project: {
                name: { $arrayElemAt: ["$productDetails.name", 0] },
                totalSold: 1
            }
        }
    ]);

    const totalSold = topProducts.reduce((sum, product) => sum + product.totalSold, 0);

    return topProducts.map(product => ({
        name: product.name,
        totalSold: product.totalSold,
        percentage: Math.round((product.totalSold / totalSold) * 100)
    }));
}

async function getBestSellingProducts(limit = 10) {
    return await getTopProducts(limit);
}





async function getBestSellingCategories(limit = 10) {
    const bestCategories = await Order.aggregate([
        { $unwind: "$itemsOrdered" },
        {
            $lookup: {
                from: "products",
                localField: "itemsOrdered.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $group: {
                _id: "$product.category",
                totalSold: { $sum: "$itemsOrdered.quantity" }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        {
            $project: {
                name: { $arrayElemAt: ["$categoryDetails.name", 0] },
                totalSold: 1
            }
        }
    ]);

    return bestCategories;
}









async function getBestSellingBrands(limit = 10) {
    const bestBrands = await Order.aggregate([
        { $unwind: "$itemsOrdered" },
        {
            $lookup: {
                from: "products",
                localField: "itemsOrdered.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $group: {
                _id: "$product.brand",
                totalSold: { $sum: "$itemsOrdered.quantity" }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "brands",
                localField: "_id",
                foreignField: "_id",
                as: "brandDetails"
            }
        },
        {
            $project: {
                name: { $arrayElemAt: ["$brandDetails.name", 0] },
                totalSold: 1
            }
        }
    ]);

    return bestBrands;
}




async function getRecentSales() {
    const sales = await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name')
        .lean();

    return sales.map(sale => ({
        id: sale._id,
        userId: sale.userId ? sale.userId._id : 'N/A',
        customerName: sale.userId ? sale.userId.name : 'Unknown',
        itemName: sale.itemsOrdered.length > 0 ? sale.itemsOrdered[0].productName : 'N/A',
        orderDate: sale.createdAt,
        status: sale.status,
        price: sale.totalAmount
    }));
}



function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'completed':
            return 'success';
        case 'pending':
            return 'warning';
        case 'cancelled':
            return 'danger';
        default:
            return 'secondary';
    }
}





module.exports = {
    loadDashboard,
    generateSalesReport,
    getBestSellingProducts,
    getBestSellingCategories,
    getBestSellingBrands
};


