const dotenv = require("dotenv").config();



const config = {
    NODE_ENV : process.env.NODE_ENV || 'development',
    BASE_URL : process.env.BASE_URL
}

module.exports = config
