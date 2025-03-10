const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {  // 🔹 Remove async
    try {
        const jwtToken = req.header("token");
        console.log("JWT Token received in header:", jwtToken); // Debugging

        if (!jwtToken) {
            console.error("No token provided");
            return res.status(403).json("Not Authorised");
        }

        if (!process.env.jwtSecret) {
            console.error("jwtSecret is not defined in environment variables");
            return res.status(500).json("Internal Server Error");
        }

        // Verify Token
        const payload = jwt.verify(jwtToken, process.env.jwtSecret);
        console.log("JWT Payload:", payload);

        // Ensure user ID is properly attached
        req.user = payload.user;
        next();
    } catch (err) {
        console.error("Error verifying token:", err.message);
        return res.status(403).json("Not Authorised");
    }
};
