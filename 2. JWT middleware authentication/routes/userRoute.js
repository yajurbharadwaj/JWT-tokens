
const express = require("express");
const user_route = express();

const bodyParser = require("body-parser");                                  //this body parser variable is used to encode the data
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

const multer = require("multer");                                            //files can be easily uploaded using the multer module. hence it is imported
const path = require("path");                                                   //yje path function is used for the other files to access the userRoute file. 
//eg if public folder has an image file and someone need access, we use path module.

user_route.use(express.static('public'));

//since multer has been installed now provide storage destination.

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'), function (error, success) {
            if (error) throw error
        })
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name, function (error1, success1) {
            if (error1) throw error1
        })
    }
});

const upload = multer({ storage: storage }); //the value storage is defined nefore, has been passed to the storage now.

const user_controller = require("../controllers/userController"); // now user controller has been imported to this file.

const auth = require('../middleware/auth')
user_route.post('/register', upload.single('image'), user_controller.register_user);
//this will create register route for the API. i.e we use port function to post 'register we use upload single to upload single 'image'.

user_route.post('/login', user_controller.user_login); //user controller is used to keep & provide all the methods related to user

user_route.get('/test', auth, function (req, res) {
    res.status(200).send({ success: true, msg: "authenticated" })
})

module.exports = user_route;

