const jwt = require("jsonwebtoken");

exports.requireSignin  = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
  
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return res.status(403).json("Token is not valid!");
        }
  
        req.user = user;
        next();
      });
    } else {
      res.status(401).json({message : "You are not authenticated!"});
    }
  };


/* exports.userMiddleware = (req, res, next) => {
    if (req.user.role !== "USER") {
        return res.status(400).json({ message: "User access denied" })
    }
    next()
} */

/* exports.artistMiddleware = (req, res, next) => {
    if (req.user.role !== "ARTIST") {
        return res.status(400).json({ message: "Admin Access denied" })
    }
    next()
}   */