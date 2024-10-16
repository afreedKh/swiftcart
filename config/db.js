const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
// const db = async()=>{
//     try {
//        await  mongoose.connect(process.env.mongodb);
//         console.log('DB connected');
//     } catch (error) {
//         console.log("DB failed to connect",error.message);
//         process.exit(1);
//     }
       
// }

// module.exports=db

const db = async () => {
    try {
        await mongoose.connect(process.env.mongodb, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Remove the following two options if using Mongoose 6.x or later
            // useCreateIndex: true,
            // useFindAndModify: false
        });
        console.log('DB connected to Atlas');
    } catch (error) {
        console.log("DB failed to connect", error.message);
        process.exit(1);
    }
}

module.exports = db;