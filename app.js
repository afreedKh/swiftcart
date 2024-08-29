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



app.listen(port,()=>{
    console.log(`server started on http://localhost:${port}`);
})