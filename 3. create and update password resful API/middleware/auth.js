const jwt = require("jsonwebtoken");
const config = require("../config/config"); //this config is imported to get the secret token to thus file

const verifyToken = async (req, res, next) => {    //next is used to proceed to next requests
    const token = req.body.token || req.query.token || req.headers["authorization"];

    if (!token) {
        res.status(200).send({ success: false, msg: "token is required for authentication" })
    }
    try {
        const descode = jwt.verify(token, config.secret_jwt);
        req.user = descode;

    } catch (error) {
        res.status(400).send("invalid token");
    }
    return next();
}

module.exports = verifyToken;