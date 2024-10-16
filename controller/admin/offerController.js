const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");
const Offer = require("../../models/offerModel");

const loadOffer = async (req, res) => {
    try {
        const search = req.query.search || '';  
        const limit = 10; 
        const page = req.query.page || 1;  
        const offers = await Offer.find({ name: { $regex: search, $options: 'i' } }) 
            .sort({ createdAt: -1 })  
            .skip((page - 1) * limit)
            .limit(limit);
        const totalOffers = await Offer.countDocuments({ name: { $regex: search, $options: 'i' } });
        const totalPages = Math.ceil(totalOffers / limit);

        res.render('adminOffer', { offers, search, page, totalPages, limit });
    } catch (error) {
        console.error(error);
        res.render('adminOffer', { offers: [], search: '', page: 1, totalPages: 1, limit: 10 });
    }
};

const loadAddOffer = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false }); 
        const categories = await Category.find({ isDeleted: false });

        res.render("adminAddOffer", { products, categories });
    } catch (error) {
        res.render('adminAddOffer', { products: [], categories: [] });
        console.log('loadAddOffer error', error.message);
    }
};

const addOffer = async (req, res) => {
    try {
        const { name, type, discount, startDate, endDate, applicableId } = req.body;

        

        const existingOffer = await Offer.findOne({ name });
        if (existingOffer) {
            return res.status(400).json({ message: 'Offer name already exists.' });
        }

        

        const newOffer = new Offer({
            name,
            type,
            discount,
            startDate,
            endDate,
            applicableId: Array.isArray(applicableId) ? applicableId : [applicableId],
            isActive: true
        });

        await newOffer.save();

        if (type === 'product') {
            await Product.updateMany(
                { _id: { $in: newOffer.applicableId } },
                { $set: { offer: newOffer._id } }
            );
        } else if (type === 'category') {
            const products = await Product.find({ category: { $in: newOffer.applicableId } });
            await Product.updateMany(
                { _id: { $in: products.map(p => p._id) } },
                { $set: { offer: newOffer._id } }
            );
        }

        res.redirect('/admin/offers?success=Offer Added Successfully');
    } catch (error) {
        return res.status(404).render("404");

    }
};


const loadEditOffer = async (req, res) => {
    try {
        const offerId = req.params.id;
        const offer = await Offer.findById(offerId);
        const products = await Product.find({ isDeleted: false });
        const categories = await Category.find({ isDeleted: false });

        if (!offer) {
            return res.status(404).render("404");

        }

        res.render('adminEditOffer', { offer, products, categories });
    } catch (error) {
        console.error('Error loading offer for editing:', error.message);
        return res.status(404).render("404");

    }
};

const updateOffer = async (req, res) => {
    try {
        const offerId = req.params.id; 
        const { name, type, discount, startDate, endDate, applicableId } = req.body;

        const offer = await Offer.findOne({name:name , _id:{$ne:offerId}})

        if(offer){
           return res.status(404).json({success :false , message:"Offer name already exist"})
        }

        const existingOffer = await Offer.findById(offerId);

        if (!existingOffer) {
            return res.status(404).render("404");

        }

        await Product.updateMany(
            { offer: offerId },
            { $unset: { offer: "" } }
        );

        existingOffer.name = name;
        existingOffer.type = type;
        existingOffer.discount = discount;
        existingOffer.startDate = new Date(startDate);
        existingOffer.endDate = new Date(endDate);
        existingOffer.applicableId = Array.isArray(applicableId) ? applicableId : [applicableId];
        
        await existingOffer.save();

        if (type === 'product') {
            await Product.updateMany(
                { _id: { $in: existingOffer.applicableId } },
                { $set: { offer: existingOffer._id } }
            );
        } else if (type === 'category') {
            const products = await Product.find({ category: { $in: existingOffer.applicableId } });
            await Product.updateMany(
                { _id: { $in: products.map(p => p._id) } },
                { $set: { offer: existingOffer._id } }
            );
        }

        res.json({ success: true, message: 'Offer Updated Successfully' });
    } catch (error) {
        console.error('Error updating offer:', error.message);
        return res.status(404).render("404");

    }
};





const activateOffer = async (req, res) => {
    try {
        const offerId = req.params.id;
        const offer = await Offer.findById(offerId);
        
        if (!offer) {
            return res.status(404).render("404");
        }

        offer.isActive = true;
        await offer.save();

       
        if (offer.type === 'product') {
            await Product.updateMany(
                { _id: { $in: offer.applicableId } },
                { $set: { offer: offer._id } }
            );
        } else if (offer.type === 'category') {
            const products = await Product.find({ category: { $in: offer.applicableId } });
            await Product.updateMany(
                { _id: { $in: products.map(p => p._id) } },
                { $set: { offer: offer._id } }
            );
        }

        res.json({ success: true, message: 'Offer activated successfully' });
    } catch (error) {
        console.log('activateOffer error', error.message);
        return res.status(404).render("404");

    }
};

const deactivateOffer = async (req, res) => {
    try {
        const offerId = req.params.id;
        const offer = await Offer.findById(offerId);
        
        if (!offer) {
            return res.status(404).render("404");
        }

        offer.isActive = false;
        await offer.save();

      
        await Product.updateMany(
            { offer: offerId },
            { $unset: { offer: "" } }
        );

        res.json({ success: true, message: 'Offer deactivated successfully' });
    } catch (error) {
        console.log('deactivateOffer error', error.message);
        return res.status(404).render("404");

    }
};








module.exports = {
    loadOffer,
    loadAddOffer,
    addOffer,
    loadEditOffer,
    updateOffer,
    activateOffer,
    deactivateOffer
};
