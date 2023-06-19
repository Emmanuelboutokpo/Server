 const express = require('express');
const router = express.Router();
const multer = require("multer");
const shortId =require("shortid");
const path =require("path");
const { signup, signin, refreshToken} = require('../controllers/userCntroller');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.dirname(__dirname), "uploads"))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, shortId.generate() + '-' + file.originalname)
    }
})

const upload = multer({storage});
router.post('/signup', upload.single("photo"), signup);
router.post('/refresh',refreshToken);
router.post('/signup', signup);
router.post('/signin',signin);


module.exports = router;
