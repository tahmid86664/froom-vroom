var express = require('express');
var router = express.Router();
const {check, validationResult} = require('express-validator');
const { ObjectID } = require('mongodb');

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

// my models
const User = require('../models/user');
const Product = require('../models/product');
const SoldProduct = require('../models/sold_product');

// my modules
const global = require('../my_modules/global');

/* GET methods */
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'User Login'
  });
});

router.get('/register', (req, res) => {
  res.render('register', {
    title: 'User Register'
  });
});

router.get('/:username/dashboard', (req, res) => {
  res.render('user_dashboard', {
    title: "User Dashboard"
  })
})



/* =================post methods =================== */
// register post
router.post('/register', [
  check("username", "Username filed is empty").notEmpty(),
  check("email", "Email filed is empty").notEmpty(),
  check("password1", "Password is required").notEmpty(),
  check("mobile_number", "Mobile Number is required").notEmpty(),
  check('password1', "Password should have at least 5 characters").isLength({min: 5})
  // check('password2', "Password does not match").custom((value, {req}) => {
  //   if(value !== req.body.password1){
  //     throw new Error('Password confirmation does not match password');
  //   }
  // })
],
(req, res) => {
  let errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render('register', {
      title: "User Register",
      errors: errors.mapped()
    })

    return;
  }

  // get the info and store
  let username = req.body.username;
  let email = req.body.email;
  let password1 = req.body.password1;
  let password2 = req.body.password2;
  let mobile_number = req.body.mobile_number;
  let address = req.body.address;
  if(!address){
    adress = "";
  }

  let newUser = new User({
    username: username,
    email: email,
    password: password1,
    mobile: mobile_number,
    address: address,
    profile_image: "no-image.png",
    purchase: []
  });

  User.createUser(newUser, (err, result) => {
    if(err) throw err;
    console.log(result);
  })

  req.flash('success', "You're successfully registered");
  // redirect
  res.location('/users/login');
  res.redirect('/users/login');
})


// ========== LOGIN=========
// for the user session, serialized and deserialized
passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findUserById(id, (err, user) => {
    done(err, user)
  })
})

//our local strategy
passport.use(new localStrategy({
  passReqToCallback: true
}, (req, username, password, done) => {
    User.findUserByUsername(username, (err, user) => {
      if (err) return done(err)
      if(!user){
        console.log('User not registered')
        return done(null, false, {message: 'User not registered'})
      }
      
      User.comparePassword(password, user.password, (err, isMatch) => {
        if(err) return done(err)
        if(isMatch){
          return done(null, user)
        }else{
          console.log('Incorrect Password')
          return done(null, false, {message: 'Incorrect Password'})
        }
      });
    });
  }
));

// login post
router.post('/login', 
  passport.authenticate('local', {failureFlash: 'Invalid username and password', failureRedirect: '/users/login'}),
  (req, res) => {
    req.flash('success', 'You have logged in successfully');
    res.redirect('/users/'+req.body.username+'/dashboard');
});

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success', 'You have logged out successfully')
  console.log("logged out")
  res.redirect('/')
})

// ===================================cart related===================================
router.get('/mycart', (req, res) => {
  // console.log(req.cookies);
  // get from cookies
  let items = {}
  for(let key in req.cookies){
    if(key.substring(0,2) === "BN"){ // BN are products(By Buynow)
      items[key]= req.cookies[key]
    }
  }
  console.log(items);

  res.render('cart', {
    title: 'My Cart',
    items: items
  })
})

//================clear cart===================
router.get("/mycart/clear", (req, res) => {
  for(let key in req.cookies){
    if(key.substring(0,2) === "BN"){ // BN are products(By Buynow)
      res.clearCookie(key) // clear the cookies
    }
  }
  req.flash("success", "Your cart is cleared")
  res.redirect("/users/mycart");
})
// =====================add one product====================
router.get("/mycart/increase/:cookieId/:product_id/:product_title/:product_price/:qty", (req, res) => {
  if(req.params.qty > 1){
    global.productInfo = {
      product_id: req.params.product_id,
      product_title: req.params.product_title,
      product_price: req.params.product_price,
      product_qty: parseInt(req.params.qty) + 1
    }
    res.cookie(req.params.cookieId, global.productInfo); // update it
    res.redirect("/users/mycart/decrease");
    console.log("updated item");
  }
})
router.get("/mycart/increase", (req, res) => {
  req.flash("success", "Cart has been changed");
  res.redirect("/users/mycart");
})

// =====================decrease one product====================
router.get("/mycart/decrease/:cookieId/:product_id/:product_title/:product_price/:qty", (req, res) => {
  if(req.params.qty > 1){
    global.productInfo = {
      product_id: req.params.product_id,
      product_title: req.params.product_title,
      product_price: req.params.product_price,
      product_qty: parseInt(req.params.qty) - 1
    }
    res.cookie(req.params.cookieId, global.productInfo); // update it
    res.redirect("/users/mycart/decrease");
    console.log("updated item");
  }else{
    req.flash("error", "You're trying to get less then one! If want to remove then please press remove button")
    res.redirect("/users/mycart");
  }
})
router.get("/mycart/decrease", (req, res) => {
  req.flash("success", "Cart has been changed");
  res.redirect("/users/mycart");
})

// ===========================remove one product================
router.get("/mycart/remove/:cookieId", (req, res) => {      
  res.clearCookie(req.params.cookieId); // clear the product
  res.redirect("/users/mycart/remove");
  console.log("updated cart");
})
router.get("/mycart/remove", (req, res) => {
  req.flash("success", "Cart has been changed");
  res.redirect("/users/mycart");
});




/* ========================= related to Payments ============================ */
router.get('/mycart/payments', (req, res) => {
  if(!req.user){
    res.redirect('/users/login');
  }else{
    res.redirect('/users/'+req.user._id+'/payment-method')
  }
})
router.get('/:user_id/payment-method', (req, res) => {
  // User.findUserById(req.params.user_id, (err, result) => {
  //   res.render('payments', {
  //     title: 'Payment'
  //   })
  // })
  res.render('payments', {
    title: 'Payment'
  }) 
})
router.post('/:user_id/payment-method', (req, res) => {
  // get the items from cookies
  let items = [];
  let isUpdated = false;
  for(let key in req.cookies){
    if(key.substring(0,2) === "BN"){ // BN are products(By Buynow)
      items[key]= req.cookies[key]
      //update the database of user
      User.updateUsername({_id: ObjectID(req.params.user_id)}, {$push: {purchase: {product: items[key], date: Date()}}}, (err, result) => {
        if(err) throw err;
        console.log(result);
        // store the sold item to new database for later use
        let newSold = new SoldProduct({
          sold_product_id: items[key].product_id,
          sold_product_title: items[key].product_title,
          sold_product_price: items[key].product_price,
          sold_qty: parseInt(items[key].product_qty),
          sold_date: Date(),
          buyer_username: req.user.username,
          buyer_mobile: req.user.mobile,
          buyer_address: req.body.address
        });

        SoldProduct.insertProduct(newSold, (errI, resultI) => {
          if(errI) throw errI;
          console.log(resultI);
          res.redirect('/users/'+ req.params.user_id +'/dashboard');
        })
        
      })
      console.log(key)
      console.log(items[key])
    }
  }
  console.log(items)
})


// ====================== image uppload==================
router.post('/:username/change/profile_image', global.uploadProfileImg, (req, res) => {
  // get the image ingo
  let profileImageName;
  // validation
  if(!req.file) {
    req.flash('error', 'No image uploaded');
    res.redirect('/users/'+req.params.username+'/dashboard');
  }else{
    profileImageName = req.file.filename;
    let profileImageOriginalName = req.file.originalname;
    let profileImagePath = req.file.path;
    let profileImageMime = req.file.mimetype;
    let profileImageSize = req.file.size;

    User.updateUsername({username: req.params.username}, {$set: {profile_image: profileImageName}}, (err, result) => {
      if(err) throw err;
      console.log(result);
    })

    req.flash('success', 'Profile image is updated succesfully');
    res.redirect('/users/'+req.params.username+'/dashboard');
  }
})


module.exports = router;
