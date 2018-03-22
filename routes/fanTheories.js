const express = require('express');
const router = express.Router();
const url = require('url');
var querystring = require('querystring');

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

router.post('/addComment/:id', function(req, res){
  let fanTheory = {};
  fanTheory.comments = [];

  FanTheories.find({_id:req.params.id}, function(err, ft){
    if(err){
      console.log(err);
    }
    else{
      console.log('this is it1-'+ft[0].comments);
      fanTheory.comments = ft[0].comments;
      console.log('this is it2-'+fanTheory.comments);
      console.log('this is it3-'+fanTheory.comments);
      console.log('user'+req.user.name);
      fanTheory.comments.push({msg:req.body.comment, usr:req.user.name});
      console.log('user'+req.user.name);
      console.log('this is it4-'+fanTheory.comments);

      let query = {_id:req.params.id};

      FanTheories.update(query, fanTheory, function(err){
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
    FanTheories.find({}, function(err, FanTheories){
      if(err){
        console.log(err);
      }
      else{
        //console.log(FanTheories);
        let totalPages;
        if(FanTheories.length % 5 === 0)
          totalPages = FanTheories.length / 5;
        else
          totalPages = Math.floor(FanTheories.length / 5 + 1);
        console.log('Total : ' + totalPages);

        let pageno = req.params.page;
        //FanTheories.reverse();
        FanTheories.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.dateandtime) - new Date(a.dateandtime);
        });
        FanTheories.splice(0, (pageno - 1) * 5);
        if(FanTheories.length > 5){
          FanTheories.splice(5, FanTheories.length - 5);
        }

        res.render('index', {
          pageDescription: 'The Home route',
          fanTheories: FanTheories,
          errors:false,
          page: pageno,
          totalPages: totalPages
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

router.get('/filtered/:page', function(req, res){

});

router.post('/filtered', function(req, res){
  //console.log(req.body.filterCheckbox);
  //res.send('filter page');
  if(req.user){
    let fts1 = [];

    FanTheories.find({}, function(err, fts){

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

        console.log('After splicing - ');
        console.log(fts1);
        console.log('User - ' + req.user.name);
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
            "valid":"your string here",
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

  FanTheories.findById(req.params.id, function(err, fanTheory){
    ft.likedBy = fanTheory.likedBy;
    ft.likedBy.push(req.user.email);

    let query = {_id:req.params.id};

    FanTheories.update(query, ft, function(err){
      if(err){
        console.log(err);
      }
      else{
        req.flash('success', 'Fan Theory liked!');
        res.redirect('/');
      }
    });

  });

});

router.get('/removeLike/:id', function(req, res){
  let ft = {};
  ft.likedBy = [];

  FanTheories.findById(req.params.id, function(err, fanTheory){
    ft.likedBy = fanTheory.likedBy;
    ft.likedBy.pop(ft.indexOf(req.user.email));

    let query = {_id:req.params.id};

    FanTheories.update(query, ft, function(err){
      if(err){
        console.log(err);
      }
      else{
        req.flash('success', 'Fan Theory unliked!');
        res.redirect('/');
      }
    });

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
