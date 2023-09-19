/*
const express = require("express"); //import express.js
const app = express();

const mongoose = require("mongoose"); //import mongoose
mongoose.connect("mongodb://127.0.0.1:27017/ECOM")


//user routes
const user_routes = require("./routes/userRoute");

app.use('/api', user_routes);

app.listen(3000, function () {
    console.log("server is ready")
}); //this service will be passed into server 3000 port

*/








const express = require("express");
const app = express();
const cors = require('cors');

app.use(cors({
    origin: '*'
}));

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/ECOM");

//user routes
const user_routes = require("./routes/userRoute");

app.use('/api', user_routes);


app.listen(3000, function () {
    console.log("Server is ready");
});
