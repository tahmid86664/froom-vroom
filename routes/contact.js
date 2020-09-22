var express = require('express');
var router = express.Router();
const nodemailer = require('nodemailer');

/* GET home page. */
router.get('/', function(req, res, next) { //the router shouldn't be changed. cause contact is root for contact own
  res.render('contact', { title: 'Contact Us' });
});

// post
router.post('/send', (req, res) =>{
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    auth: {
      user: 'habijabi7788@gmail.com',
      pass: 'habijabi7788'
    }
  });

  let mailOptions = {
    from: 'Habijabi <habijabi7788@gmail.com>',
    to: 'habijabi7788@gmail.com',
    subject: 'website submission',
    text: 'You have a new submission with the following details...Name: '+req.body.name+'Email: '+req.body.email+'Message: '+req.body.message+'',
    html: '<p>You got a new submission with the following details...</p><ul><li>Name: '+req.body.name+'</li><li>Email: '+req.body.email+'</li><li>Message: '+req.body.message+'</li></ul>'
  };

  transporter.sendMail(mailOptions, (error, info)=>{
    if(error){
      console.log(error);
      res.redirect('/contact');
    }else{
      console.log('Message sent successfully: '+info.response);
      res.redirect('/contact');
    }
  })
})

module.exports = router;
