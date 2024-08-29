const multer = require('multer');
const path = require('path')

// Set up storage engine
const storage = multer.diskStorage({
    destination: './public/assets/images/hero-slider/home-3',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload variable
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, 
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('bannerImage');






// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}



module.exports=upload;