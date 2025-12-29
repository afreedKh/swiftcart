const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const db = require("./config/db");

const path = require("path");
const port = process.env.PORT || 4000;

app.use(express.static(path.join(__dirname, "public")));

const userRoute = require("./routes/userRoutes");
const adminRoute = require("./routes/adminRoutes");

app.use("/", userRoute);
app.use("/admin", adminRoute);

app.use((req, res, next) => {
  res.redirect("/404");
});

const startServer = async () => {
  try {
    await db();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to the database", error);
  }
};

startServer();
