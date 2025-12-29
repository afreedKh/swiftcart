const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const db = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database Connected Successfully on atlas");
    });
    await mongoose.connect(process.env.mongodb);
  } catch (error) {
    console.log("DB failed to connect", error.message);
    process.exit(1);
  }
};

module.exports = db;
