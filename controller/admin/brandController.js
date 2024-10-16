const Brand = require('../../models/brandModel');

const loadBrands = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const success = req.query.success || null;
        const search = req.query.search || '';

        const query = search ? { name: { $regex: search, $options: 'i' } } : {};

        const totalBrands = await Brand.countDocuments(query);
        const totalPages = Math.ceil(totalBrands / limit);


        const brands = await Brand.find(query)
            .sort({ createdAt: -1 ,_id: -1})
            .skip((page - 1) * limit)
            .limit(limit);


        res.render("adminBrand", { brands, success, search, page, totalPages, limit });
    } catch (error) {
        console.log("brand page load error", error.message);
        return res.status(404).render("404");

    }
}




const addBrands = async(req,res)=>{


    try {
        
        res.render("adminAddBrands")


    } catch (error) {
        console.log("add brands error",error.message);
        return res.status(404).render("404");

    }
}





const verifyBrands = async(req,res)=>{
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
           
            validationErrors.invalidName = "Invalid Brands";
        }


        
        
      const alreadyExist = await Brand.findOne({name})


      if(alreadyExist){
             validationErrors.invalidName = "Brands already exists";
      }



      if(Object.keys(validationErrors).length > 0){
        validationErrors.name=name;
        res.render("adminAddBrands",  validationErrors );
        
    
       
        
    }else{

        

       const newBrands= new Brand({
            name:name
       }) 

            await newBrands.save();

             res.redirect("/admin/brands?success=Brand saved successfully!");
       
    }
    } catch (error) {
        
        console.log("add brand error",error.message);
        return res.status(404).render("404");

    }
}





const editBrands = async(req,res)=>{
    try {

       const brands= await Brand.findById(req.params.id);
       if(brands){
          return res.render("adminEditBrands",{brands});
       }
       
        

        
    } catch (error) {
        console.log('edit brands error',error.message);
        return res.status(404).render("404");

    }
}



const updateBrands= async(req,res)=>{
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
           
            validationErrors.invalidName = "Invalid Brand";
        }


        
        
      const alreadyExist = await Brand.findOne({name})


      if(alreadyExist){
             validationErrors.invalidName = "Brand already exists";
      }

      const brands= await Brand.findById(req.params.id);
      

      if(Object.keys(validationErrors).length > 0){
        validationErrors.brands=brands
        res.render("adminEditBrands",  validationErrors);
        
      }else{
        
     
        const updated = {name:name};
        const brands = await Brand.findByIdAndUpdate(
            req.params.id,
            {$set:updated},
            {new:true})


        if(brands){
            return res.redirect("/admin/brands?success=Your work has been saved");
        }
    }
        
    } catch (error) {
        console.log("update brand error",error.message);
        return res.status(404).render("404");

    }
}





const blockBrands = async(req,res)=>{
    try {

        await Brand.findByIdAndUpdate(req.params.id,{isDeleted:true})

            res.json({success:true, message:"Brand blocked Successfully"})

    } catch (error) {
        console.log('block brand error',error.message);
        return res.status(404).render("404");

    }
}



const unblockBrands = async(req,res)=>{
    try {

        await Brand.findByIdAndUpdate(req.params.id,{isDeleted:false})

            res.json({success:true, message:"Brand unblocked Successfully"})

    } catch (error) {
        console.log('unblocked brand error',error.message);
        return res.status(404).render("404");

    }
}

module.exports={
    loadBrands,
    addBrands,
    verifyBrands,
    editBrands,
    updateBrands,
    blockBrands,
    unblockBrands
}