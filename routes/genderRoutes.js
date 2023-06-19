const express = require('express');
const {requireSignin } = require('../middleware');
const { createCategory, getAllCategory, getCategory, updateCategory, deleteCategory } = require('../controllers/genderController');
 
const router = express.Router();
 
router.post('/addCat', requireSignin,createCategory);
router.get("/getAllCategory", getAllCategory);
router.get('/getCategory/:id',getCategory);
router.put("/putCategory/:id",requireSignin, updateCategory); 
router.delete("/deleteCategory/:id", requireSignin,deleteCategory); 

module.exports = router;