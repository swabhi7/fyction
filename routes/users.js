const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

let Users = require('../models/Users');

router.get('/signup', function(req, res){
  res.render('signup', {
    pageDescription: 'Sign Up',
    errors: false
  });
});

router.post('/signup', function(req, res){
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('confirmPassword', 'Passwords do not match').equals(req.body.password);
  req.checkBody('email', 'Entered email is not valid').isEmail();

  let errors = req.validationErrors();

  if(errors){
    res.render('signup', {
      pageDescription: 'Sign Up',
      errors: errors
    });
  }
  else{
    let newUser = new Users({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
          return;
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          }
          else{
            req.flash('success', 'Signed up! Proceed to login.');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});

router.post('/login', function(req, res, next){
  console.log(req.body.email);
  console.log(req.body.password);
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
  console.log('After authenticate');
});

router.get('/login', function(req, res){
  res.render('login', {
    pageDescription: 'Login',
    errors: false
  });
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out. Proceed to login.');
  res.redirect('/users/login');
});



module.exports = router;
