const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');

// my models
const Category = require('../models/category');
const Product = require('../models/product');
const Comment = require('../models/comment');

// my modules
const global = require('../my_modules/global');
const { ObjectID } = require('mongodb');

router.use(cookieParser());
//try to store in cookie( the cart data actually)
router.use((req, res, next) => {
  if(global.addItemToCookie){
    let randomName = Math.random().toString().substring(2);
    let cookieName = "BN" + randomName; //BN are products that added(By Buynow)
    let cookie = req.cookies.$cookieName;
    res.cookie(cookieName, global.productInfo, {maxAge: 9000000, httpOnly: true, secure: false})
    console.log("item added");
    global.addItemToCookie = false;
  }
  next();
});

// get category
router.get('/show/:category_name', (req, res) =>{
    console.log(req.params.category_name);
    let catName = req.params.category_name.replace(':', '');
    Category.findCategory({category_name: catName}, (errC, resultC) => {
        if(errC) throw errC;
        Product.findProducts({product_category: catName}, (errP, resultP) => {
            if(errP) throw errP;
            res.render('products', {
                title: catName,
                category: resultC[0],
                products: resultP
            });
        })
        // console.log(resultC);
    });
});

// get sub-category
router.get('/show/:category_name/:subcategory_name', (req, res) =>{
    console.log(req.params.category_name);
    let catName = req.params.category_name.replace(':', '');
    let subCatName = req.params.subcategory_name.replace(':', '');

    Category.findCategory({category_name: catName}, (errC, resultC) => {
        if(errC) throw errC;
        Product.findProducts({product_category: subCatName}, (errP, resultP) => {
            if(errP) throw errP;
            res.render('products', {
                title: subCatName,
                category: resultC[0],
                subcategory: subCatName,
                products: resultP
            });
        })
        
        // console.log(resultC);
    });
});


// get individual product with category
router.get('/show/:category_name/:product_id', (req, res) => {
    let product_id = req.params.product_id.replace(':', '');
    let catName = req.params.category_name.replace(':', '');
    Product.findProducts({_id: product_id}, (errP, resultP) => {
        if (errP) throw errP;
        Comment.findComments({productId: product_id}, (errC, resultC) => {
            if(errC) throw errC;
            res.render('product', {
                title: 'Product ' + product_id,
                product: resultP[0],
                category: catName,
                comments: resultC
            });
        }) 
    });
});

// get individual product with subcategory
router.get('/show/:category_name/:subcategory/:product_id', (req, res) => {
    let product_id = req.params.product_id.replace(':', '');
    let catName = req.params.category_name.replace(':', '');
    let subCatName = req.params.subcategory.replace(':', '');
    Product.findProducts({_id: product_id}, (errP, resultP) => {
        if (errP) throw errP;
        Comment.findComments({productId: product_id}, (errC, resultC) => {
            if(errC) throw errC;
            res.render('product', {
                title: 'Product ' + product_id,
                product: resultP[0],
                category: catName,
                subcategory: subCatName,
                comments: resultC
            });
        }) 
    });
});


// ============question area==================
router.post('/show/:category_name/:product_id/question', (req, res) => {
    if(!req.user){
        req.flash("error", "You must be login to comment or ask")
        res.redirect('/users/login')
    }else{
        let question = req.body.question

        if(question === ""){
            req.flash("error", "question field is empty")
            res.redirect('/categories/show/'+req.params.category_name+'/' +req.params.product_id);
        }else{
            // save it
            let newComment = new Comment({
                question: question,
                person: req.user.username,
                personImage: req.user.personImage,
                productId: req.params.product_id,
                replies: [],
                date: Date()
            })
            Comment.insertComment(newComment, (err, result) => {
                if(err) throw err;
                console.log(result);
            })
            req.flash("success", "Comented successfully added")
            res.redirect('/categories/show/'+req.params.category_name+'/' +req.params.product_id);

        }
    }
})
// sub categories
router.post('/show/:category_name/:subcategory/:product_id/question', (req, res) => {
    if(!req.user){
        req.flash("error", "You must be login to comment or ask")
        res.redirect('/users/login')
    }else{
        let question = req.body.question

        if(question === ""){
            req.flash("error", "question field is empty")
            res.redirect('/categories/show/'+req.params.category_name+'/'+req.params.subcategory+'/' +req.params.product_id);
        }else{
            // save it
            let newComment = new Comment({
                question: question,
                person: req.user.username,
                personImage: req.user.profile_image,
                productId: req.params.product_id,
                replies: [],
                date: Date()
            })
            Comment.insertComment(newComment, (err, result) => {
                if(err) throw err;
                console.log(result);
            })
            req.flash("success", "Comented successfully added")
            res.redirect('/categories/show/'+req.params.category_name+'/'+req.params.subcategory+'/' +req.params.product_id);
        }
    }
});




// add to cart
// for those which hasn't subcategory
router.post('/show/:category/:product_id/addtocart', (req, res) => {
    if(!req.body.qty){
        req.flash("error", "Please fill Qty. field")
        res.redirect('/categories/show/'+ req.params.category + '/' +req.params.product_id);
    }else{
        Product.findProducts({_id: ObjectID(req.params.product_id)}, (err, result) => {
            if(err) throw err;
            if(!global.addItemToCookie){
                // need to add item to cart and also in cookies
                global.productInfo = {
                    product_id: req.params.product_id,
                    product_title: result[0].product_title,
                    product_price: result[0].product_price,
                    product_qty: req.body.qty
                }
                global.addItemToCookie = true; // give permission to add cookies
                res.redirect('/categories/show/'+ req.params.category + '/' +req.params.product_id+'/addtocart')
                console.log('Item Added to cart');
            }
        })
    }
})
router.get('/show/:category/:product_id/addtocart', (req, res) => {
    req.flash('success', "Item is added to cart");
    res.redirect("/categories/show/" + req.params.category + "/" + req.params.product_id);
})

// for those which has subcategory
router.post('/show/:categpry/:subcategory/:product_id/addtocart', (req, res) => {
    if(!req.body.qty){
        req.flash("error", "Please fill Qty. field")
        res.redirect('/categories/show/'+ req.params.category + '/' + req.params.subcategory + '/' +req.params.product_id);
    }else{
        Product.findProducts({_id: ObjectID(req.params.product_id)}, (err, result) => {
            if(err) throw err;
            if(!global.addItemToCookie){
                // need to add item to cart and also in cookies
                global.productInfo = {
                    product_id: req.params.product_id,
                    product_title: result[0].product_title,
                    product_price: result[0].product_price,
                    product_qty: req.body.qty
                }
                global.addItemToCookie = true; // give permission to add cookies
                res.redirect('/categories/show/'+ req.params.category + '/' + req.params.subcategory + '/' +req.params.product_id+'/addtocart')
                console.log('Item Added to cart');
            }
        })
    }
});
router.get('/show/:category/:subcategory/:product_id/addtocart', (req, res) => {
    req.flash('success', "Item is added to cart");
    res.redirect("/categories/show/" + req.params.category + "/" + req.params.subcategory + "/" + req.params.product_id);
});


// buy now
// for those which hasn't subcategory
router.post('/show/:category/:product_id/buynow', (req, res) => {
    if(!req.body.qty){
        req.flash("error", "Please fill Qty. field")
        res.redirect('/categories/show/'+ req.params.category + '/' +req.params.product_id);
    }else{
        Product.findProducts({_id: ObjectID(req.params.product_id)}, (err, result) => {
            if(err) throw err;
            if(!global.addItemToCookie){
                // need to add item to cart and also in cookies
                global.productInfo = {
                    product_id: req.params.product_id,
                    product_title: result[0].product_title,
                    product_price: result[0].product_price,
                    product_qty: req.body.qty
                }
                global.addItemToCookie = true; // give permission to add cookies
                res.redirect('/categories/show/'+ req.params.category + '/' +req.params.product_id+'/buynow');
                console.log('Item Added to cart');
            }
        })
    }
})
router.get('/show/:category/:product_id/buynow', (req, res) => {
    res.location('/');
    res.redirect('/users/mycart');
})


// for those which has subcategory
router.post('/show/:category/:subcategory/:product_id/buynow', (req, res) => {
    if(!req.body.qty){
        req.flash("error", "Please fill Qty. field")
        res.redirect('/categories/show/'+ req.params.category + '/' + req.params.subcategory + '/' +req.params.product_id);
    }else{
        Product.findProducts({_id: ObjectID(req.params.product_id)}, (err, result) => {
            if(err) throw err;
            if(!global.addItemToCookie){
                // need to add item to cart and also in cookies
                global.productInfo = {
                    product_id: req.params.product_id,
                    product_title: result[0].product_title,
                    product_price: result[0].product_price,
                    product_qty: req.body.qty
                }
                global.addItemToCookie = true; // give permission to add cookies
                res.redirect('/categories/show/'+ req.params.category + '/' + req.params.subcategory + '/' +req.params.product_id+'/buynow');
                console.log('Item Added to cart');
            }
        })
    }
})
router.get('/show/:category/:subcategory/:product_id/buynow', (req, res) => {
    res.location('/');
    res.redirect('/users/mycart');
})

module.exports = router;
