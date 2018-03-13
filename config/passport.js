const LocalStrategy = require('passport-local').Strategy;
const Users = require('../models/Users');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = function(passport){
  console.log('Hello from inside7');
  passport.use(new LocalStrategy(function(email, password, done){
    console.log('Hello from inside6');
    let query = {email: email};
    Users.findOne(query, function(err, user){
      if(err){
        console.log('Hello from inside');
        throw err;
      }
      if(!user){
        console.log('Hello from inside1');
        return done(null, false, {message: 'User not found'});
      }

      bcrypt.compare(password, user.password, function(err, isMatch){
        if(err){
          console.log('Hello from inside2');
          throw err;
        }
        if(isMatch){
          console.log('Hello from inside3');
          return done(null, user);
        }
        else{
          console.log('Hello from inside4');
          return done(null, false, {message: 'Wrong password'});
        }
      });

    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    Users.findById(id, function(err, user) {
      done(err, user);
    });
  });

};
