const path = require('path')
const multer = require('multer');





const storage = multer.diskStorage({
    destination: 'public/assets/images/product/default/home-3', 
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);


      cb(null, filename);
      
      
    }
  });

  

  
  const upload = multer({ storage ,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }})

  module.exports=upload;