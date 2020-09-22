var express = require('express');
var router = express.Router();

// my models
const Product = require('../models/product');
const Category = require('../models/category');
const SoldProduct = require('../models/sold_product');

/* GET home page. */
router.get('/', function(req, res, next) {
  Category.findCategory({}, (errC, resultC) => {
    if(errC) throw errC
    Product.findProducts({}, (errP, resultP) => {
      if(errP) throw errP;
      SoldProduct.findSoldProducts({}, (errS, resultS) => {
        if(errS) throw errS;
        res.render('index', { 
          title: 'Home',
          categories: resultC,
          products: resultP,
          topSells: resultS
        });
      })

    })
  })
});



module.exports = router;
