// in this file, we create all the methods that we use, related to the users

const User = require("../models/userModel"); //import the file usermodel from the model file. we bring the users here to register the user.

const bcryptjs = require("bcryptjs"); //bcrypt helps in password hashing. i.e passwords can be acheived in relatable form.

const config = require("../config/config");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");

const randomstring = require("randomstring");

const sendResetPasswordMail = async (name, email, token) => {

    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: 'For Reset Password',
            html: '<p> Hii ' + name + ', Please copy the link and <a href="http://127.0.0.1:3000/api/reset-password?token=' + token + '"> reset your password</a>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Mail has been sent:- ", info.response);
            }
        });

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }

}
const create_token = async (id) => {     //id is the parameter here
    try {
        const token = await jwt.sign({ _id: id }, config.secret_jwt);
        return token;

    } catch (error) {
        res.status(400).send(error.message);
    }

}

const securePassword = async (password) => {  //define secrePassword for register user
    try {
        const passwordHash = await bcryptjs.hash(password, 10); // this will promise a function.
        return passwordHash; // this will return the function

    } catch (error) {
        res.status(400).send(error.message);

    }
};
const register_user = async (req, res) => {   //to register user method, we obtain with try catch block.
    try {
        const spassword = await securePassword(req.body.password);

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: spassword,
            image: req.file.filename,
            type: req.body.type,
            mobile: req.body.mobile
        });

        const userData = await User.findOne({ email: req.body.email }) //to check if the email is sent or not
        if (userData) {
            res.status(200).send({ success: false, msg: "this email already exists" })
        }
        else {
            const user_data = await user.save();
            res.status(200).send({ success: true, data: user_data });
        }
    } catch (error) {
        res.status(400).send(error.message); // 400 error message i.e 1 error found, will be forwarded 
    }
};

//login method imported from userRoute.js

const user_login = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });
        if (userData) {              //for password, bcrypt, passsword hashing are already provided. now we use compare method
            const passwordMatch = await bcryptjs.compare(password, userData.password);

            if (passwordMatch) {     //if the password and email match together, we use ready response method

                const tokenData = await create_token(userData._id);     //userID is going in response instead of tokenID

                const userResult = {
                    _id: userData._id,
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    image: userData.image,
                    mobile: userData.mobile,
                    type: userData.type,
                    token: tokenData
                }   //here all the userData parameters wil be passed into userResult.

                const response = {
                    success: true,
                    msg: "user Details",
                    data: userResult   //here all the userResult will be assigned as a ready response (iff email and passwords matches)
                }
                res.status(200).send(response);
            }

            else {
                res.status(200).send({ success: false, msg: "login details are incorrect" });
            }
        }

        else {
            res.status(200).send({ success: false, msg: "login details are incorrect" });
        }

    } catch (error) {
        res.status(400).send(error.message);
    }
}

// update password method

const update_password = async (req, res) => {
    try {

        const user_id = req.body.user_id;
        const password = req.body.password;

        const data = await User.findOne({ _id: user_id });

        if (data) {
            const newPassword = await securePassword(password);
            const userData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: newPassword } })
            res.status(200).send({ success: true, msg: "your password has been updated" });
        } else {
            res.status(200).send({ success: false, msg: "User id not found" });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};


//forget password method

const forget_password = async (req, res) => {
    try {

        const email = req.body.email;
        const userData = await User.findOne({ email: email });

        if (userData) {
            const randomString = randomstring.generate();
            const data = await User.updateOne({ email: email }, { $set: { token: randomString } });
            sendResetPasswordMail(userData.name, userData.email, randomString);
            res.status(200).send({ success: true, msg: "Please check your inbox of mail and reset your password." });
        }
        else {
            res.status(200).send({ success: true, msg: "This email does not exists." });
        }

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const reset_password = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            const password = req.body.password;
            const newPassword = await securePassword(password);
            const userData = await User.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: newPassword, token: '' } }, { new: true });
            res.status(200).send({ success: true, msg: "User Password has been reset", data: userData });
        }
        else {
            res.status(200).send({ success: true, msg: "This link has been expired." });
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

/*const forget_password = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });
        if (userData) {
            const randomString = randomstring.generate();
            const Data = await User.updateOne({ email: email }, { $set: { token: randomString } });
            sendResetPasswordMail(userData.name, userData.email, randomString);

            res.status(200).send({ success: true, msg: "please check your inbox of your mail and reset your password" });

        } else {
            res.status(200).send({ success: true, msg: "this email doeesnot exists" });
        }

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const reset_password = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });
        if (tokenData) {
            const password = req.body.password; //this exports the password but we need in hashed format
            const newPassword = await securePassword(password);     //securePassword module has been alreadey declared to just importedto this module to use hashed pwd
            const userData = await User.findByIdAndUpdate({ _id: tokenData._id }, { $set: { password: newPassword, token: '' } }, { new: true });
            res.status(200).send({ success: true, msg: "user password has been reset. your welcome", data: userData });
        } else {
            res.status(200).send({ success: true, msg: "this link has been expired" })
        }
    } catch (error) {
        res.status(400).send({ success: false, msg: error.message })
    }
}*/
module.exports = {
    register_user,
    user_login,
    update_password,
    forget_password,
    reset_password
}


