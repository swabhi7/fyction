const express = require('express');
const router = express.Router();
const url = require('url');
var querystring = require('querystring');

let FanFictions = require('../models/FanFictions');
let FanTheories = require('../models/FanTheories');
let Users = require('../models/Users');


router.get('/add', ensureAuthenticated, function(req, res){
  res.render('addFanFiction', {
    pageDescription: 'The addFanFiction page',
    errors:false
  });
});

router.post('/addComment/:id', function(req, res){
  let fanFiction = {};
  fanFiction.comments = [];

  FanFictions.find({_id:req.params.id}, function(err, ft){
    if(err){
      console.log(err);
    }
    else{
      console.log('this is it1-'+ft[0].comments);
      fanFiction.comments = ft[0].comments;
      console.log('this is it2-'+fanFiction.comments);
      console.log('this is it3-'+fanFiction.comments);
      console.log('user'+req.user.name);
      fanFiction.comments.push({msg:req.body.comment, usr:req.user.name});
      console.log('user'+req.user.name);
      console.log('this is it4-'+fanFiction.comments);

      let query = {_id:req.params.id};

      FanFictions.update(query, fanFiction, function(err){
        if(err){
          console.log(err);
        }
        else{
          req.flash('success', 'Comment posted!');
          res.redirect('/');
        }
      });


    }
  });



});

router.get('/page/:page', function(req, res){
  if(req.user){
    FanFictions.find({}, function(err, FanFictions){
      if(err){
        console.log(err);
      }
      else{
        //console.log(FanTheories);
        let totalPages;
        if(FanFictions.length % 5 === 0)
          totalPages = FanFictions.length / 5;
        else
          totalPages = Math.floor(FanFictions.length / 5 + 1);
        console.log('Total : ' + totalPages);

        let pageno = req.params.page;
        //FanTheories.reverse();
        FanFictions.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.dateandtime) - new Date(a.dateandtime);
        });
        FanFictions.splice(0, (pageno - 1) * 5);
        if(FanFictions.length > 5){
          FanFictions.splice(5, FanFictions.length - 5);
        }

        let fts;
        FanTheories.find({}, function(err, fantheories){
          if(err){
            console.log(err);
          }
          else{
            fts = fantheories;
            fts.sort(function(a,b){
            // Turn your strings into dates, and then subtract them
            // to get a value that is either negative, positive, or zero.
            return new Date(b.dateandtime) - new Date(a.dateandtime);
            });

            let tp1;
            if(fts.length % 5 === 0)
              tp1 = fts.length / 5;
            else
              tp1 = Math.floor(fts.length / 5 + 1);

            res.render('index', {
              pageDescription: 'The Home route',
              fanFictions: FanFictions,
              fanTheories: fts,
              errors:false,
              page: 1,
              totalPages: tp1,
              page1: pageno,
              totalPages1: totalPages
            });
          }
        });


      }
    });
  }
  else{
    res.render('preLoginHome', {
      pageDescription: 'The Nerd Home',
      errors: false
    });
  }
});


router.post('/filtered', function(req, res){
  //console.log(req.body.filterCheckbox);
  //res.send('filter page');
  if(req.user){
    let fts1 = [];

    FanFictions.find({}, function(err, fts){

      if(err){

        console.log(err);
      }
      else{
        //let fts1 = [];
        fts.forEach(function(ft){
          if(req.body.filterCheckbox instanceof Array){
            req.body.filterCheckbox.forEach(function(filter){
              if(ft.category == filter){
                console.log(ft.category);
                fts1.push(ft);
              }
            });
          }
          else{
            if(ft.category == req.body.filterCheckbox){
              fts1.push(ft);
            }
          }
        });


        /*res.render('index', {
          pageDescription: 'The Home route',
          fanTheories: fts,
          errors:false,
          page: 1,
          totalPages: 1
        });*/

        //res.redirect('/');
        res.redirect(url.format({
         pathname:"/",
         query: {
            "page": 1,
            "b": 2,
            "valid":"fiction",
            "x": JSON.stringify(fts1)
          }
       }));


      }
    });
  }
  else{
    res.render('preLoginHome', {
      pageDescription: 'The Nerd Home',
      errors: false
    });
  }




  /*FanTheories.find({category : { $in : req.body.filterCheckbox}}, function(err, fts){
    if(err){
      console.log(err);
    }
    else{
      let totalPages;
      if(fts.length % 5 === 0)
        totalPages = fts.length / 5;
      else
        totalPages = Math.floor(fts.length / 5 + 1);
      console.log('Total : ' + totalPages);

      let pageno = 1;
      fts.reverse();
      fts.splice(0, (pageno - 1) * 5);
      if(fts.length > 5){
        fts.splice(5, fts.length - 5);
      }

      res.render('index', {
        pageDescription: 'The Home route',
        fanTheories: fts,
        errors:false,
        page: 1,
        totalPages: 1
      });
    }
  });
  //res.send('meh');*/
});

router.get('/addLike/:id', function(req, res){
  let ft = {};
  ft.likedBy = [];

  FanFictions.findById(req.params.id, function(err, fanTheory){
    ft.likedBy = fanTheory.likedBy;
    ft.likedBy.push(req.user.email);

    let query = {_id:req.params.id};

    FanFictions.update(query, ft, function(err){
      if(err){
        console.log(err);
      }
      else{
        req.flash('success', 'Fan Fiction liked!');
        res.redirect('/');
      }
    });

  });

});


router.post('/add', function(req, res){

  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('description', 'Fiction is required').notEmpty();

  let errors = req.validationErrors();

  if(errors){
    res.render('addFanFiction', {
      pageDescription: 'The addFanFiction page',
      errors: errors
    });
  }
  else{
    let fanTheory = new FanFictions();
    fanTheory.title = req.body.title;
    fanTheory.body = req.body.description;
    fanTheory.author = req.user.name;
    fanTheory.category = req.body.category;
    fanTheory.noOfLikes = 0;
    fanTheory.date = '';
    fanTheory.time = '';
    fanTheory.comments = [];
    fanTheory.dateandtime = Date();

    fanTheory.save(function(err){
      if(err){
        console.log(err);
      }
      else{
        req.flash('success', 'Fan Fiction added!');
        res.redirect('/');
      }
    });
  }

});

router.get('/edit/:id', ensureAuthenticated, function(req, res){
  FanFictions.findById(req.params.id, function(err, fanTheory){

    res.render('editFanFiction', {
      pageDescription : 'The Edit Fan Fiction page',
      fanFiction : fanTheory,
      errors:false
    });
  });
});

router.post('/edit/:id', function(req, res){
  let fanTheory = {};
  fanTheory.title = req.body.title;
  fanTheory.body = req.body.description;

  let query = {_id:req.params.id};

  FanFictions.update(query, fanTheory, function(err){
    if(err){
      console.log(err);
    }
    else{
      req.flash('success', 'Fan Fiction updated!');
      res.redirect('/');
    }
  });
});

router.delete('/delete/:id', function(req, res){
  let query = {_id:req.params.id};

  FanFictions.remove(query, function(err){
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
