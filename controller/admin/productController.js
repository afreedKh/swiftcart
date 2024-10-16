const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel")
const Offer = require("../../models/offerModel")
const Brand = require("../../models/brandModel");

const loadProduct = async(req,res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';

        const query = {
            name: { $regex: search, $options: 'i' }
        };

        const totalProducts = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(query)
            .populate('varients')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);


            const activeOffers = await Offer.find({
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() },
                isActive: true
              });

              const productsWithOffers = products.map(product => {
                let offer = null;
          
                // Check if an offer is applicable to this product or its category
                activeOffers.forEach(o => {
                  if (o.type === 'product' && o.applicableId.includes(product._id)) {
                    offer = o;
                  } else if (o.type === 'category' && o.applicableId.includes(product.category)) {
                    offer = o;
                  }
                });
          
                if (offer) {
                  product.discount = offer.discount;
                  product.discountedPrice = product.price * (1 - offer.discount / 100);
                } else {
                  product.discount = null;
                  product.discountedPrice = product.price;
                }
          
                return product;
              });

        res.render("adminProduct", {
            product: productsWithOffers,
            currentPage: page,
            totalPages: totalPages,
            search: search
        });

    } catch (error) {
        console.log('loadProduct error', error.message);
        return res.status(404).render("404");

    }
}



const addProduct = async(req,res)=>{
    try {
        const categories = await Category.find({isDeleted:false})
        const brands = await Brand.find({ isDeleted: false });
        res.render("adminAddProduct",{categories,brands})
    } catch (error) {
        console.log("add product error",error.message);
        return res.status(404).render("404");

    }
}


const editProduct = async(req,res)=>{
    try {

        const product = await Product.findById(req.params.id)
        const categories = await Category.find({isDeleted:false})
        const brands = await Brand.find({ isDeleted: false });
        res.render("adminEditProduct",{product,categories,brands})
    } catch (error) {
        console.log("edit product error",error.message);
        return res.status(404).render("404");

    }
}






       






const uploadProduct = async (req, res) => {
    try {
        const { productName, productPrice,productCategory,productBrand, productDescription, varients } = req.body;
        const productSpecification = req.body.specifications || [];  

        const validationErrors = {};

        if (!productBrand || productBrand === '') {
            validationErrors.invalidBrand = "Brand is required";
        }

        if (!productCategory || productCategory === '') {
            validationErrors.invalidCategory = "Category is required";
        }
       
        const productError =productName.length < 8 || productName === ''

        if (productError) {
            validationErrors.invalidName = "Product Name Need At least 8 Characters";
        }
        
        if (productPrice < 1 || isNaN(productPrice) || productPrice === '') {
            validationErrors.invalidPrice = "Product Price Must Be A Number and Minimum 1";
        }

        if (productDescription.length < 20 || productDescription === '') {
            validationErrors.invalidDescription = "Product Description Need At least 20 Characters";
        }

        if (productSpecification.length === 0) {
            validationErrors.invalidSpecification = "At least one specification is required";
        } else {
            productSpecification.forEach((spec, index) => {
                if (spec.key.length < 2) {
                    validationErrors[`invalidSpecKey${index}`] = "Specification key needs at least 2 characters";
                }
                if (spec.value.length < 2) {
                    validationErrors[`invalidSpecValue${index}`] = "Specification value needs at least 2 characters";
                }
            });
        }

        varients.forEach((variant, index) => {
            if (!variant.color || (typeof variant.color === 'string' && variant.color.trim() === '') || !variant.color.match(/^[A-Za-z\s]+$/)) {
                validationErrors[`invalidVariantColor${index}`] = "Variant color is required and should contain only letters and spaces";
            }
            
            
            if (!variant.colorCode || !/^#[0-9A-F]{6}$/i.test(variant.colorCode)) {
                validationErrors[`variantColorCode${index}`] = "Valid color code is required for variant (e.g., #FFFFFF)";
            }
            
            if (isNaN(variant.stock) || parseInt(variant.stock) <= 0) {
                validationErrors[`variantStock${index}`] = "Stock value minimum 1 stock required";
            }
            
            const variantImages = req.files.filter(file => file.fieldname === `varients[${index}][images]`);
            if (variantImages.length < 3) {
                validationErrors[`variantImages${index}`] = "At least 3 images are required for each variant";
            }
            
            variantImages.forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    validationErrors[`variantImageSize${index}`] = "Each image must be less than 5 MB for variant";
                }
            });
        });

        if (Object.keys(validationErrors).length > 0) {
            console.log(validationErrors);
            return res.json({ success: false, validationErrors });
        }

        const processedVariants = await Promise.all(varients.map(async (variant, index) => {
            const variantImages = req.files.filter(file => file.fieldname === `varients[${index}][images]`);
            return {
                color: {
                    color: variant.color,
                    colorCode: variant.colorCode
                },
                stock: parseInt(variant.stock),
                images: variantImages.map((file) => ({
                    url: `/assets/images/product/default/home-3/${file.filename}`,
                    altText: variant.color
                }))
            };
        }));

        const newProduct = new Product({
            name: productName,
            price: parseFloat(productPrice),
            category:productCategory,
            brand: productBrand,
            description: productDescription,
            specification: productSpecification.map(spec => ({ key: spec.key, value: spec.value })),
            varients: processedVariants

        });

        await newProduct.save();

        res.json({ success: true, message: "Product added successfully" });

    } catch (error) {
        console.error('Error adding product:', error);
        return res.status(404).render("404");

    }
};
























const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { productName, productPrice,productCategory,productBrand, productDescription, specifications, productVarients ,varients} = req.body;
        const product = await Product.findById(productId);
        
        const filteredSpecifications = specifications.filter(spec => spec && spec.key && spec.value);

        
        
        const validationErrors = {};

        if (productName.length < 8 || productName === '') {
            validationErrors.invalidName = "Product Name Need At least 8 Characters";
        }

        if (!productBrand || productBrand === '') {
            validationErrors.invalidBrand = "Brand is required";
        }

        if (!productCategory || productCategory === '') {
            validationErrors.invalidCategory = "Category is required";
        }
       
       

        if (req.files) {
            
            
            req.files.forEach(file => {
                if (file.size > 5 * 1024 * 1024) {
                    validationErrors.imageSize = "Each image must be less than 5 MB";
                }
               
            });
        }

        if (productPrice < 1 || isNaN(productPrice) || productPrice === '') {
            validationErrors.invalidPrice = "Product Price Must Be A Number and Minimum 1";
        }

        if (productDescription.length < 20 || productDescription === '') {
            validationErrors.invalidDescription = "Product Description Need At least 20 Characters";
        }

        if (!filteredSpecifications || filteredSpecifications.length === 0) {
            validationErrors.invalidSpecification = "At least one specification is required";
        } else {
            filteredSpecifications.forEach((spec, index) => {
                if (spec.key.length < 2) {
                    validationErrors[`invalidSpecKey${index}`] = "Specification key needs at least 2 characters";
                }
                if (spec.value.length < 2) {
                    validationErrors[`invalidSpecValue${index}`] = "Specification value needs at least 2 characters";
                }
            });
        }
        if (productVarients && productVarients.length > 0) {
            productVarients.forEach((variant, index) => {
                if (!variant.color || variant.color.trim() === '') {
                    validationErrors[`invalidVariantColor${index}`] = "Variant color is required";
                }
                if (!variant.colorCode || !variant.colorCode.match(/^#[0-9A-F]{6}$/i)) {
                    validationErrors[`invalidVariantColorCode${index}`] = "Invalid color code format";
                }
                if (isNaN(variant.stock) || variant.stock < 1) {
                    validationErrors[`invalidVariantStock${index}`] = "Stock must be min 1";
                }
            });
        } else {
            validationErrors.invalidVariants = "At least one variant is required";
        }

        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({ success: false, validationErrors });
        }





        const processedVariants = await Promise.all(productVarients.map(async (variant, index) => {
            const color = {
                color: variant.color || '',
                colorCode: variant.colorCode || ''
            };
        
            let images = [];
            const varient = varients[index];
        
            if (varient && varient.existingImages) {
                images = varient.existingImages.map((url, imgIndex) => {
                    return {
                        url: url,
                        altText: color.color
                    };
                });
            }
        
            const variantImages = req.files ? req.files.filter(file => file.fieldname.startsWith(`varients[${index}][images]`)) : [];
        
            variantImages.forEach((file) => {
                const imgIndex = parseInt(file.fieldname.match(/\[(\d+)\]$/)[1]);
                const newImageUrl = `/assets/images/product/default/home-3/${file.filename}`;
                
                if (imgIndex < images.length) {
                    images[imgIndex] = {
                        url: newImageUrl,
                        altText: color.color
                    };
                } else {
                    // Add new image
                    images.push({
                        url: newImageUrl,
                        altText: color.color
                    });
                }
            });
        
        
            return {
                color,
                stock: parseInt(variant.stock) || 0,
                images
            };
        }));
        

        const updatedProduct = await Product.findByIdAndUpdate(productId, {
            name: productName,
            price: parseFloat(productPrice),
            category:productCategory,
            brand: productBrand,
            description: productDescription,
            specification: filteredSpecifications,
            varients: processedVariants
        }, { new: true });
        

        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (err) {
        console.error(err);
        return res.status(404).render("404");

    }
};







const deleteImages = async (req, res) => {
    try {
        const imageId = req.params.id;

        const product = await Product.findOneAndUpdate(
            { 'varients.images._id': imageId },
            { $pull: { 'varients.$.images': { _id: imageId } } },
            { new: true }
        );

        if (product) {
            product.varients.forEach(variant => {
                variant.images = variant.images.filter(image => image !== null);
            });

            await product.save();

            return res.json({ message: 'Image deleted successfully', product });
        } else {
            return res.status(404).json({ error: 'Image Not Found' });
        }
    } catch (error) {
        console.error('deleteImages error:', error.message);
        return res.status(404).render("404");

    }
};
















const blockProduct = async(req,res)=>{
    try {

       await Product.findByIdAndUpdate(req.params.id,{$set:{isDeleted:true}})

       res.json({success:true})


        
    } catch (error) {
       

        console.log('blockProduct error',error.message);
        return res.status(404).render("404");

    }
}








const unblockProduct = async(req,res)=>{
    try {

        await Product.findByIdAndUpdate(req.params.id,{$set:{isDeleted:false}})
        res.json({success:true})


        
    } catch (error) {
        console.log('unblockProduct error',error.message);
        return res.status(404).render("404");


    }
}




module.exports={
    loadProduct,
    addProduct,
    editProduct,
    uploadProduct,
    updateProduct,
    deleteImages,
    blockProduct,
    unblockProduct
}
