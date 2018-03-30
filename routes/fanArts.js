const express = require('express');
const multer = require('multer');
const router = express.Router();
const url = require('url');
const path = require('path');
var querystring = require('querystring');

let FanFictions = require('../models/FanFictions');
let FanTheories = require('../models/FanTheories');
let Users = require('../models/Users');
let FanArts = require('../models/FanArts');


const storage = multer.diskStorage({
  destination: '../public/uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
}).single('fanArt');


router.get('/add', function(req, res){
  res.render('addFanArt', {
    pageDescription: 'Add your Fan Art',
    errors: false
  });
});

router.post('/add', function(req, res){
  upload(req, res, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log(req.file);

      req.checkBody('caption', 'Caption is required').notEmpty();
      //req.checkBody('description', 'Fiction is required').notEmpty();

      let errors = req.validationErrors();

      if(errors){
        res.render('addFanArt', {
          pageDescription: 'The addFanArt page',
          errors: errors
        });
      }
      else{
        console.log('yo1');
        let fanArt = new FanArts();
        fanArt.caption = req.body.caption;
        fanArt.filename = req.file.filename;
        fanArt.createdBy = req.user.name;
        fanArt.category = req.body.category;
        fanArt.noOfLikes = 0;
        fanArt.date = '';
        fanArt.time = '';
        fanArt.comments = [];
        fanArt.dateandtime = Date();
        fanArt.email = req.user.email;

        fanArt.save(function(err){
          if(err){
            console.log(err);
          }
          else{

            req.flash('success', 'Fan Art added!');
            res.redirect('/');
          }
        });

      }
    }
  });
});

// Access control

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else {
    req.flash('danger', 'Not authorized. Please login.');
    res.redirect('/users/login');
  }
}

module.exports = router;
