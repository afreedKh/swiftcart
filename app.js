const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const db = require('./config/db')
db();
const path = require('path');
const port = process.env.PORT;




app.use(express.static(path.join(__dirname, 'public')));

const userRoute = require('./routes/userRoutes');
const adminRoute = require('./routes/adminRoutes');


app.use('/',userRoute);
app.use('/admin',adminRoute);


app.use((req, res, next) => {
    res.redirect("/404")
});


db().then(() => {
   
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
}).catch(error => {
    console.error('Failed to connect to the database', error);
});