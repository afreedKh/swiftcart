const Category = require("../../models/categoryModel");

const categories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const success = req.query.success || null;
        const search = req.query.search || '';

        const query = search ? { name: { $regex: search, $options: 'i' } } : {};

        const totalCategories = await Category.countDocuments(query);
        const totalPages = Math.ceil(totalCategories / limit);


        const categories = await Category.find(query)
            .sort({ createdAt: -1 ,_id: -1})
            .skip((page - 1) * limit)
            .limit(limit);


        res.render("adminCategory", { categories, success, search, page, totalPages, limit });
    } catch (error) {
        console.log("categories page load error", error.message);
        return res.status(404).render("404");

    }
}





const addCategories = async(req,res)=>{


    try {
        
        res.render("adminAddCategories")


    } catch (error) {
        console.log("add categories error",error.message);
        return res.status(404).render("404");

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
        return res.status(404).render("404");

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
        return res.status(404).render("404");

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
        return res.status(404).render("404");

    }
}



const blockCategories = async(req,res)=>{
    try {

        await Category.findByIdAndUpdate(req.params.id,{isDeleted:true})

            res.json({success:true, message:"Category blocked Successfully"})

    } catch (error) {
        console.log('block category error',error.message);
        return res.status(404).render("404");

    }
}



const unblockCategories = async(req,res)=>{
    try {

        await Category.findByIdAndUpdate(req.params.id,{isDeleted:false})

            res.json({success:true, message:"Category unblocked Successfully"})

    } catch (error) {
        console.log('unblocked category error',error.message);
        return res.status(404).render("404");

    }
}





module.exports={
    categories,
    addCategories,
    verifyCategories,
    editCategories,
    updateCategories,
    blockCategories,
    unblockCategories
}
