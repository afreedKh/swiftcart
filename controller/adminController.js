const User = require("../models/userModel");
const bcrypt = require("bcrypt")
const Banner = require("../models/bannerModel");
const Category = require("../models/categoryModel");
const Product = require('../models/productModel')
const bannerUpload = require('../middlewares/bannerUploadMiddleware');







const loadLogin = async(req,res)=>{
    try {
        res.render("login")
        
    } catch (error) {
        console.log("admin login page load error",error.message);
    }
}











const verifyLogin = async(req,res)=>{

    try {

        const {email,password}=req.body;

        const validateEmail = (email) => {
            return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        };


        const validationErrors = {};

        if (!validateEmail(email)) {
            validationErrors.invalidEmail = "Invalid email ";
        }

        if (Object.keys(validationErrors).length > 0) {
            return res.render('login', { validationErrors });
        }
        
        const userData =await User.findOne({email});
        if(userData){
           
           const passwordMatch= await bcrypt.compare(password,userData.password);
           if(passwordMatch){
            if(userData.is_admin===0){
               
                res.render('login',{message:"Email and password is incorrect"});
            }else{

                req.session.admin=userData;
                
                res.redirect('/admin/dashboard')
            }
           }else{
            
            res.render('login',{message:"Email and password is incorrect"});
           }
        }else{
           
            res.render('login',{message:"Email and password is incorrect"});
        }

        
    } catch (error) {
        console.log("verify login error ",error.message);
    }
}













const loadDashboard = async(req,res)=>{
    try {

        res.render("adminDashboard");
        
    } catch (error) {
        console.log("load home page error",error.message);
    }
}









const loadBanner = async (req, res) => {
    try {
        const banners = await Banner.find();
            res.render("adminBanner", {banners});
    } catch (error) {
        console.log("loadBanner page error", error.message);
    }
};          












  

const uploadBanner = async(req,res)=>{
    bannerUpload(req, res, async (err) => {
        if (err) {
            res.render('adminBanner', { message: err });
        } else {
            if (req.file == undefined) {
                res.render('adminBanner', { message: 'No file selected!' });
            } else {
                // Save banner information to MongoDB
                const newBanner = new Banner({
                    image: req.file.filename,
                    title: req.body.title,
                    description: req.body.description,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    status: req.body.status
                });

                try {
                    await newBanner.save();
                    res.redirect('/admin/banner');
                } catch (error) {
                    res.render('adminBanner', { message: 'Error saving banner to database.' });
                }
            }
        }
    });
}









const editBanner = async(req,res)=>{

    try {

        const banner = await Banner.findById(req.params.id);
        if(banner){
            res.render("adminEditBanner",{banner});
        }else{
            res.redirect("/admin/banner");
        }
        
    } catch (error) {
        console.log("edit Banner error",error.message);
        res.redirect("/admin/banner");
    }
}





const updateBanner = async (req, res) => {
    try {
        
        const { title, description, startDate, endDate, status } = req.body;
        let updateData = { title, description, startDate, endDate, status };

        if (req.file) {
            updateData.image = req.file.path; // Adjust based on your file upload handling
        }

      
        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true } 
        );
        if (updatedBanner) {
            res.redirect("/admin/banner");
        } else {
            res.redirect("/admin/banner");
        }

    } catch (error) {
        console.error("updateBanner error:", error.message);
        res.redirect("/admin/banner");
    }
};








const blockBanner = async(req,res)=>{
    try {
        await Banner.findByIdAndUpdate(req.params.id,{isDeleted:true})       
            res.json({ success: true, message: 'Banner deleted successfully' });
     
    } catch (error) {
        res.json({ success: false, message: 'Banner not found' });
        console.log("block Banner error",error.message);
       
    }
}





const unblockBanner = async(req,res)=>{
    try {
        await Banner.findByIdAndUpdate(req.params.id,{isDeleted:false})       
            res.json({ success: true, message: 'Banner deleted successfully' });
     
    } catch (error) {
        res.json({ success: false, message: 'Banner not found' });
        console.log("unblock Banner error",error.message);
       
    }
}





const userManagement = async (req,res)=>{
    try {
        
    const users = await User.find({is_admin:0})
    
    res.render("userManagement",{users})


    } catch (error) {
        console.log("userManagement error",error.message);
    }
}





const blockUser = async(req,res)=>{
    try {
        if(req.session&&req.session.admin){
            delete req.session.user
        }
       
        await User.findByIdAndUpdate(req.params.id,{isBlocked:true})
        
      
        res.json({ success: true, message: 'User blocked successfully' });
    } catch (error) {
        console.log("block user error",error.message);
        res.json({ success: false, message: 'User blocked error' });
    }
}






const unblockUser = async(req,res)=>{
    try {

        await User.findByIdAndUpdate(req.params.id,{isBlocked:false})
        res.json({ success: true, message: 'User unblocked successfully' });
    } catch (error) {
        console.log("block user error",error.message);
        res.json({ success: false, message: 'User unblocked error' });
    }
}





const categories = async(req,res)=>{
    try {

        const success = req.query.success || null;
        const category = await Category.find().sort({createdAt:-1})

        
        
            res.render("adminCategory",{category,success});
      
        
    } catch (error) {
        console.log("categories page load error",error.message);
    }
}





const addCategories = async(req,res)=>{


    try {
        
        res.render("adminAddCategories")


    } catch (error) {
        console.log("add categories error",error.message);
    }
}



const verifyCategories = async(req,res)=>{
    try {

         const name = req.body.name.trim();
        

        const validateName = (name) => {
            return String(name)
            .toLowerCase()
            .match(
               
                /^[A-Za-z\s]+$/
            );
        };
        const validationErrors = {};
            


        if (!validateName(name)||name==="") {
           
            validationErrors.invalidName = "Invalid Category";
        }


        
        
      const alreadyExist = await Category.findOne({name})


      if(alreadyExist){
             validationErrors.invalidName = "Category already exists";
      }



      if(Object.keys(validationErrors).length > 0){
        validationErrors.name=name;
        res.render("adminAddCategories",  validationErrors );
        
    
       
        
    }else{

        

       const newCategory= new Category({
            name:name
       }) 

            await newCategory.save();

             res.redirect("/admin/categories?success=Category saved successfully!");
       
    }
    } catch (error) {
        
        console.log("add categories error",error.message);
    }
}






const editCategories = async(req,res)=>{
    try {

       const category= await Category.findById(req.params.id);
       if(category){
          return res.render("adminEditCategory",{category});
       }
       
        

        
    } catch (error) {
        console.log('edit categories error',error.message);
    }
}







const updateCategories= async(req,res)=>{
    try {
        const name = req.body.name.trim();
        

        const validateName = (name) => {
            return String(name)
            .toLowerCase()
            .match(
               
                /^[A-Za-z\s]+$/
            );
        };
        const validationErrors = {};
            


        if (!validateName(name)||name==="") {
           
            validationErrors.invalidName = "Invalid Category";
        }


        
        
      const alreadyExist = await Category.findOne({name})


      if(alreadyExist){
             validationErrors.invalidName = "Category already exists";
      }

      const category= await Category.findById(req.params.id);
      

      if(Object.keys(validationErrors).length > 0){
        validationErrors.category=category
        res.render("adminEditCategory",  validationErrors);
        
      }else{
        
     
        const updated = {name:name};
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {$set:updated},
            {new:true})


        if(category){
            return res.redirect("/admin/categories?success=Your work has been saved");
        }
    }
        
    } catch (error) {
        console.log("updateCategories error",error.message);
    }
}



const blockCategories = async(req,res)=>{
    try {

        await Category.findByIdAndUpdate(req.params.id,{isDeleted:true})

            res.json({success:true, message:"Category blocked Successfully"})

    } catch (error) {
        res.json({success:false, message:"!Error"})
        console.log('block category error',error.message);
    }
}



const unblockCategories = async(req,res)=>{
    try {

        await Category.findByIdAndUpdate(req.params.id,{isDeleted:false})

            res.json({success:true, message:"Category unblocked Successfully"})

    } catch (error) {
        res.json({success:false, message:"!Error"})
        console.log('unblocked category error',error.message);
    }
}









const loadLogout = async (req, res) => {
    try {
        
        if (req.session && req.session.admin) {
            delete req.session.admin
            setTimeout(() => {
                res.redirect('/admin');
            }, 1500);
            
        }
        
    } catch (error) {
        console.error('loadLogout error:', error.message);
        res.status(500).send('An error occurred during logout.');
    }
};






const loadProduct = async(req,res)=>{
    try {

        const product = await Product.find().populate('varients').sort({createdAt:-1})
        res.render("adminProduct",{product});

    } catch (error) {
        console.log('loadProduct error',error.message);
    }
}



const addProduct = async(req,res)=>{
    try {
        res.render("adminAddProduct")
    } catch (error) {
        console.log("add product error",error.message);
    }
}


const editProduct = async(req,res)=>{
    try {

        const product = await Product.findById(req.params.id)
        
        res.render("adminEditProduct",{product})
    } catch (error) {
        console.log("edit product error",error.message);
    }
}






       







const uploadProduct = async (req, res) => {
    try {



        const { productName, productPrice, productDescription, varients } = req.body;
  
        const productSpecification = req.body.specifications || [];  


        const validationErrors = {};




        if(productName.length<8||productName===''){
            validationErrors.invalidName = "Product Name Need Atleast 8 Characters"
        }


        if (req.files.length < 3) {
            validationErrors.invalidImages = "At least 3 Images are required";
          }
      
          req.files.forEach(file => {
            if (file.size > 5 * 1024 * 1024) { // Check file size
              validationErrors.imageSize = "Each image must be less than 5 MB";
            }
            
          });

        
        
        if (productPrice < 1 || isNaN(productPrice) || productPrice === '') {
            validationErrors.invalidPrice = "Product Price Must Be A Number and Minimum 1";
        }



        if(productDescription.length<20||productDescription===''){
            validationErrors.invalidDescription = "Product Description Need Atleast 20 Characters"
        }



        if (productSpecification.length === 0) {
            validationErrors.invalidSpecification = "At least one specification is required";
        } 
            productSpecification.forEach((spec, index) => {
                if (spec.key.length < 2) {
                    validationErrors[`invalidSpecKey${index}`] = "Specification key needs at least 2 characters";
                }
                if (spec.value.length < 2) {
                    validationErrors[`invalidSpecValue${index}`] = "Specification value needs at least 2 characters";
                }
            });
        



        if(Object.keys(validationErrors).length>0){
           console.log(validationErrors);

           res.json({success:false,validationErrors})

        }else{

        

            

        const specification = productSpecification.map(spec => ({
            key: spec.key,
            value: spec.value
        }));






        const processedVariants = await Promise.all(varients.map(async (variant, index) => {

            const color = {
                color: variant.color || '',
                colorCode: variant.colorCode || ''
            };

            let images = [];
            const variantImages = req.files.filter(file => file.fieldname === `varients[${index}][images]`);
            if (variantImages && variantImages.length > 0) {

                images = variantImages.map((file) => {
                    return {
                        url: `/assets/images/product/default/home-3/${file.filename}`,
                        altText: color.color
                    };
                });
            } else {
                console.log(`Variant ${index} has no images`);
            }


            return {
                color,
                stock: parseInt(variant.stock) || 0,
                images: images.length > 0 ? images : undefined
            };
        }));


       






        const newProduct = new Product({
            name: productName,
            price: parseFloat(productPrice),
            description: productDescription,
            specification:specification,
            varients: processedVariants
        });


        await newProduct.save();
        

        res.json({ success: true , message:"Product added successfully" });
    }

    } catch (error) {


        console.error('Error adding product:', error);



        
            res.status(500).json({ message: 'Error adding product', error: error.message });
        
    }

};















const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { productName, productPrice, productDescription, specifications, productVarients } = req.body;
        const product = await Product.findById(productId);
        
        // Perform validation
        const validationErrors = {};

        if (productName.length < 8 || productName === '') {
            validationErrors.invalidName = "Product Name Need At least 8 Characters";
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

        if (!specifications || specifications.length === 0) {
            validationErrors.invalidSpecification = "At least one specification is required";
        } else {
            specifications.forEach((spec, index) => {
                if (spec.key.length < 2) {
                    validationErrors[`invalidSpecKey${index}`] = "Specification key needs at least 2 characters";
                }
                if (spec.value.length < 2) {
                    validationErrors[`invalidSpecValue${index}`] = "Specification value needs at least 2 characters";
                }
            });
        }
        // Validate variants
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
        // Process and update images
        const processedVariants = await Promise.all(productVarients.map(async (variant, index) => {
            const color = {
                color: variant.color || '',
                colorCode: variant.colorCode || ''
            };

            let images = variant.images || [];
            // Handle new image uploads
            const variantImages = req.files ? req.files.filter(file => file.fieldname === `varients[${index}][images]`) : [];
            if (variantImages && variantImages.length > 0) {
                const newImages = variantImages.map((file) => ({
                    url: `/assets/images/product/default/home-3/${file.filename}`,
                    altText: color.color
                }));
                images = [...images, ...newImages];
            }

            return {
                color,
                stock: parseInt(variant.stock) || 0,
                images
            };
        }));
      
        
        // Update product in the database
        const updatedProduct = await Product.findByIdAndUpdate(productId, {
            name: productName,
            price: parseFloat(productPrice),
            description: productDescription,
            specification: specifications,
            varients: processedVariants
        }, { new: true });
       

        res.json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error', error: err.message });
    }
};













const deleteImages = async(req,res)=>{
    try {
        const imageId = req.params.id;
        
        const product = await Product.findOneAndUpdate(
            { 'images._id': imageId },
            { $pull: { images: { _id: imageId } } },
            { new: true }
        );

        if (product) {
            res.redirect("/admin/product?success=Deleted Successfully");
        } else {    
            res.redirect('/admin/product')
        }
    }  catch (error) {
        console.log('deleteImages error',error.message);
        res.redirect('/admin/product')  
    
    }
}















const blockProduct = async(req,res)=>{
    try {

       await Product.findByIdAndUpdate(req.params.id,{$set:{isDeleted:true}})

       res.json({success:true})


        
    } catch (error) {
        res.json({success:false})

        console.log('blockProduct error',error.message);
    }
}








const unblockProduct = async(req,res)=>{
    try {

        await Product.findByIdAndUpdate(req.params.id,{$set:{isDeleted:false}})
        res.json({success:true})


        
    } catch (error) {
        console.log('unblockProduct error',error.message);
        res.json({success:false})

    }
}

















module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    loadBanner,
    editBanner,
    updateBanner,
    uploadBanner,
    blockBanner,
    unblockBanner,
    userManagement,
    blockUser,
    unblockUser,
    categories,
    addCategories,
    editCategories,
    updateCategories,
    blockCategories,
    unblockCategories,
    verifyCategories,
    loadLogout,
    loadProduct,
    addProduct,
    editProduct,
    uploadProduct,
    updateProduct,
    blockProduct,
    unblockProduct,
    deleteImages
};



