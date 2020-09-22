const express = require('express');
var router = express.Router();

// validator
const {check, validationResult} = require('express-validator');
// database connection
const mongodb = require('mongodb');
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://tahmid:526628Tahmid@test1.mbzeo.mongodb.net/FroomVroom?retryWrites=true&w=majority");
const db = mongoose.connection;

// my global module
const global = require('../my_modules/global');

// my models
const Product = require('../models/product');
const Category = require('../models/category');

/* GET login page. */
router.get('/', (req, res) => {
  res.render('admin', { title: 'Admin Login' });
});

/* GET admin panel page. */
router.get('/panel', (req, res) => {
    res.render('admin-panel', { title: 'Admin Panel' });
});


/* ======================= post methods =============== */
/* =================== admin login ================= */
router.post('/', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    // console.log(username);
    // console.log(password);
    if(username !== "admin"){
        req.flash("errors", "Username and Password are invalid");
        res.render('admin', { 
            title: 'Admin Login', 
        })
    }else{
        if(password !== "password"){
            req.flash("errors", "Username and Password are invalid");
            res.render('admin', { 
                title: 'Admin Login', 
            })
        }else{
            // all ok
            res.location('/admin/panel');
            res.redirect('/admin/panel');
        }
    }
});




/* =================== add product ================= */
router.post('/panel', global.upload, [
    check('product_title', "Title can not be empty").notEmpty(),
    check('product_category', "Category can not be empty").notEmpty(),
    check('product_price', "Price can not be empty").notEmpty(),
    check('product_description', "Description can not be empty").notEmpty()
],
(req, res) =>{
    const errors = validationResult(req);
    console.log(errors.mapped());
    if(!errors.isEmpty()){
        console.log(errors.mapped());
        res.render('admin-panel', {
            title: "Admin Panel",
            errors: errors.mapped()
        })
        return;
    }

    // get and store the info
    let productTitle = req.body.product_title;
    let productCategory = req.body.product_category;
    let productPrice = req.body.product_price;
    let productDescription = req.body.product_description;

    // get the image ingo
    let productImageName;
    // validation
    if(!req.file) {
      productImageName = "no-image.png"
    }else{
      productImageName = req.file.filename;
      let productImageOriginalName = req.file.originalname;
      let productImagePath = req.file.path;
      let productImageMime = req.file.mimetype;
      let productImageSize = req.file.size;
    }

    let newProduct = new Product({
        product_title: productTitle,
        product_category: productCategory.toLowerCase(),
        product_price: productPrice,
        product_description: productDescription,
        product_image: productImageName 
    });

    Product.insertProduct(newProduct, (err, product) => {
        if(err) throw err;
        console.log(product);
    });

    req.flash('success', 'New product inserted');
    res.redirect('/admin/panel');

});




/* =================== add category ================= */
router.post('/panel/add_category', [
    check('category_name', 'Category name is required').notEmpty()
],(req, res) => {
    const errors = validationResult(req);
    console.log(errors.mapped());
    if(!errors.isEmpty()){
        console.log(errors.mapped());
        res.render('admin-panel', {
            title: "Admin Panel",
            errors: errors.mapped()
        })
        return;
    }

    // get the info and store
    let categoryName = req.body.category_name;

    let newCat = new Category({
        category_name: categoryName.toLowerCase(),
        subcategory: []
    })
    Category.createCategory(newCat, (err, result) => {
        if(err) throw err;
        console.log(result);
    })

    res.redirect('/admin/panel/add_category');
})

router.get('/panel/add_category', (req, res) => {
    req.flash('success', 'New category added');
    res.redirect('/admin/panel');
})

/* ========================== add sub category ============================ */
router.post('/panel/add_subcategory', [
    check('category_name_for_sub', 'Category name is required').notEmpty(),
    check('subcategory_name', 'Sub-Category name is required').notEmpty()
],(req, res) => {
    const errors = validationResult(req);
    console.log(errors.mapped());
    if(!errors.isEmpty()){
        console.log(errors.mapped());
        res.render('admin-panel', {
            title: "Admin Panel",
            errors: errors.mapped()
        })
        return;
    }

    // get the info and store
    let categoryName = req.body.category_name_for_sub.toLowerCase();
    let subCategoryName = req.body.subcategory_name.toLowerCase();

    // update the database with new sub-category
    Category.addSubCategory(categoryName, subCategoryName, (err, result) => {
        if(err) throw err;
        console.log(result);
    })

    res.redirect('/admin/panel/add_subcategory');
})

router.get('/panel/add_subcategory', (req, res) => {
    req.flash('success', 'New sub-category added');
    res.redirect('/admin/panel');
})

module.exports = router;