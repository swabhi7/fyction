const express = require('express');
const router = express.Router();

let FanTheories = require('../models/FanTheories');
let Users = require('../models/Users');

router.get('/details/:id', function(req, res){
  FanTheories.findById(req.params.id, function(err, fanTheory){
    res.render('fanTheoryDetails', {
      pageDescription : 'The Fan Theory Details page',
      fanTheory : fanTheory,
      errors:false
    });
    //console.log(fanTheory);
  });
});

router.get('/add', ensureAuthenticated, function(req, res){
  res.render('addFanTheory', {
    pageDescription: 'The addFanTheory page',
    errors:false
  });
});

router.post('/add', function(req, res){

  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('description', 'Description is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('addFanTheory', {
      pageDescription: 'The addFanTheory page',
      errors: errors
    });
  }
  else{
    let fanTheory = new FanTheories();
    fanTheory.title = req.body.title;
    fanTheory.body = req.body.description;
    fanTheory.author = req.user.name;
    fanTheory.noOfLikes = 0;
    fanTheory.date = '';
    fanTheory.time = '';
    fanTheory.comments = [];

    fanTheory.save(function(err){
      if(err){
        console.log(err);
      }
      else{
        req.flash('success', 'Fan Theory added!');
        res.redirect('/');
      }
    });
  }

});

router.get('/edit/:id', ensureAuthenticated, function(req, res){
  FanTheories.findById(req.params.id, function(err, fanTheory){
    
    res.render('editFanTheory', {
      pageDescription : 'The Edit Fan Theory page',
      fanTheory : fanTheory,
      errors:false
    });
  });
});

router.post('/edit/:id', function(req, res){
  let fanTheory = {};
  fanTheory.title = req.body.title;
  fanTheory.body = req.body.description;

  let query = {_id:req.params.id};

  FanTheories.update(query, fanTheory, function(err){
    if(err){
      console.log(err);
    }
    else{
      req.flash('success', 'Fan Theory updated!');
      res.redirect('/');
    }
  });
});

router.delete('/delete/:id', function(req, res){
  let query = {_id:req.params.id};

  FanTheories.remove(query, function(err){
    if(err){
      console.log(err);
    }
    res.send('Success');
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
