const express = require('express');
const url = require('url');
var querystring = require('querystring');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

mongoose.connect(config.database);
let db = mongoose.connection;

db.once('open', function(){
  console.log('Connected to the database :)');
});

db.on('error', function(err){
  console.log(err);
});

const app = express();

let FanTheories = require('./models/FanTheories');
let FanFictions = require('./models/FanFictions');
let FanArts = require('./models/FanArts');

//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({encoded:false}));


app.use(express.static(path.join(__dirname, 'public')));



// express-messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// express-validator middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value){
    var namespace = param.split('.'), root = namespace.shift(), formParam = root;
    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return{
      param: formParam,
      msg: msg,
      value, value
    };
  }
}));

require('./config/passport')(passport);
// express-session middleware
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {fileSize: 2000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('fanArt');

function checkFileType(file, cb){
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if(mimetype && extname){
    return cb(null, true);
  }
  else{
    cb('Error: Images only!');
  }
}

app.get('*', function(req, res, next){
  console.log('url - '+req.url);
  res.locals.user = req.user || null;
  next();
});

app.get('/fanArts/page/:page', function(req, res){
  if(req.user){
    FanArts.find({}, function(err, FanFictions1){
      if(err){
        console.log(err);
      }
      else{
        //console.log(FanTheories);

        let totalPages;
        if(FanFictions1.length % 5 === 0)
          totalPages = FanFictions1.length / 5;
        else
          totalPages = Math.floor(FanFictions1.length / 5 + 1);
        console.log('Total : ' + totalPages);

        let pageno = req.params.page;
        //FanTheories.reverse();
        FanFictions1.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.dateandtime) - new Date(a.dateandtime);
        });
        FanFictions1.splice(0, (pageno - 1) * 5);
        if(FanFictions1.length > 5){
          FanFictions1.splice(5, FanFictions1.length - 5);
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

              let ffs;
              FanFictions.find({}, function(err, fantheories1){

                if(err){
                  console.log('every5');
                  console.log(err);
                }
                else{

                  ffs = fantheories1;
                  ffs.sort(function(a,b){
                  // Turn your strings into dates, and then subtract them
                  // to get a value that is either negative, positive, or zero.
                  return new Date(b.dateandtime) - new Date(a.dateandtime);
                  });

                  let fftp;
                  if(ffs.length % 5 === 0)
                    fftp = ffs.length / 5;
                  else
                    fftp = Math.floor(ffs.length / 5 + 1);

                    res.render('index', {
                      pageDescription: 'The Home route',
                      fanFictions: ffs,
                      fanTheories: fts,
                      fanArts: FanFictions1,
                      errors:false,
                      page: 1,
                      totalPages: tp1,
                      page1: 1,
                      totalPages1: fftp,
                      page2: pageno,
                      totalPages2: totalPages
                    });

                  }
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

app.get('/', function(req, res){

  if(req.user){
    FanTheories.find({}, function(err, FanTheories1){
      if(err){
        console.log(err);
      }
      else{

        let totalPages = Math.floor(FanTheories1.length / 5 + 1);
        let pageno = 1;

        FanTheories1.sort(function(a,b){
          return new Date(b.dateandtime) - new Date(a.dateandtime);
        });

        FanTheories1.splice(0, (pageno - 1) * 5);
        if(FanTheories1.length > 5){
          FanTheories1.splice(5, FanTheories1.length - 5);
        }
        let ff, totalPages1;
        FanFictions.find({}, function(err, FanTheories){

          if(err){
            console.log(err);
          }
          else{
            totalPages1 = Math.floor(FanTheories.length / 5 + 1);
            let pageno1 = 1;

            FanTheories.sort(function(a,b){
              return new Date(b.dateandtime) - new Date(a.dateandtime);
            });

            FanTheories.splice(0, (pageno1 - 1) * 5);
            if(FanTheories.length > 5){
              FanTheories.splice(5, FanTheories.length - 5);
            }

            ff = FanTheories;

            let fa, totalPages2;
            FanArts.find({}, function(err, FanTheories){

              if(err){
                console.log(err);
              }
              else{

                totalPages2 = Math.floor(FanTheories.length / 5 + 1);
                let pageno1 = 1;

                FanTheories.sort(function(a,b){
                  return new Date(b.dateandtime) - new Date(a.dateandtime);
                });

                FanTheories.splice(0, (pageno1 - 1) * 5);
                if(FanTheories.length > 5){
                  FanTheories.splice(5, FanTheories.length - 5);
                }

                fa = FanTheories;
                <!---->

                if(req.query.x){
                  console.log('redirected');
                  let fts = JSON.parse(req.query.x);
                  let tp = Math.floor(fts.length / 5 + 1);
                  let pn = req.query.page;
                  fts.sort(function(a,b){
                    return new Date(b.dateandtime) - new Date(a.dateandtime);
                  });

                  if(req.query.valid == 'fiction'){
                    res.render('index', {
                      pageDescription: 'filteredff',
                      fanFictions: fts,
                      fanTheories: FanTheories1,
                      errors:false,
                      page: 1,
                      totalPages: totalPages,
                      page1: 1,
                      totalPages1: 1,
                      fanArts: fa,
                      totalPages2: totalPages2
                    });
                  }
                  else{
                    if(req.query.valid == 'art'){
                      res.render('index', {
                        pageDescription: 'filteredfa',
                        fanFictions: ff,
                        fanTheories: FanTheories1,
                        errors:false,
                        page: 1,
                        totalPages: 1,
                        page1: 1,
                        totalPages1: totalPages1,
                        fanArts: fts,
                        totalPages2: totalPages2
                      });
                    }
                    else{
                      res.render('index', {
                        pageDescription: 'filteredft',
                        fanFictions: ff,
                        fanTheories: fts,
                        errors:false,
                        page: 1,
                        totalPages: 1,
                        page1: 1,
                        totalPages1: totalPages1,
                        fanArts: fa,
                        totalPages2: totalPages2
                      });
                    }


                  }



                }
                else{

                  res.render('index', {
                    pageDescription: 'The Home route',
                    fanFictions: ff,
                    fanTheories: FanTheories1,
                    errors:false,
                    page: 1,
                    totalPages: totalPages,
                    page1: 1,
                    totalPages1: totalPages1,
                    fanArts: fa,
                    totalPages2: totalPages2,
                    page2: 1
                  });
                }
              }



            });




          }
        });




      }
    });

    <!---->



  }
  else{
    res.render('preLoginHome', {
      pageDescription: 'The Nerd Home',
      errors: false
    });
  }
});



app.get('/preLoginHome', function(req, res){
  res.render('preLoginHome', {
    pageDescription: 'The Nerd Home',
    errors: false
  });
});

app.get('/about', function(req, res){
  res.render('about', {
    pageDescription: 'About',
    errors: false
  });
});

app.get('/contact', function(req, res){
  res.render('contact', {
    pageDescription: 'Contact',
    errors: false
  });
});

app.get('/sendFeedback', function(req, res){
  res.render('sendFeedback', {
    pageDescription: 'Send Feedback',
    errors: false
  });
});

app.post('/fanArts/filtered', function(req, res){
  //console.log(req.body.filterCheckbox);
  //res.send('filter page');
  if(req.user){
    let fts1 = [];

    FanArts.find({}, function(err, fts){

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
            "valid":"art",
            "x": JSON.stringify(fts1)
          }
       }));
       console.log('redirected');


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

app.get('/fanArts/add', function(req, res){
  res.render('addFanArt', {
    pageDescription: 'Add your Fan Art',
    errors: false
  });
});

app.post('/fanArts/add', function(req, res){
  upload(req, res, function(err){
    if(err){
      req.flash('danger', err.message);
      res.redirect('/fanArts/add');
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
        if(req.file == undefined){
          req.flash('danger', 'No file selected');
          res.redirect('/fanArts/add');
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
    }
  });
});

app.get('/fanArts/addLike/:id', function(req, res){
  let ft = {};
  ft.likedBy = [];

  FanArts.findById(req.params.id, function(err, fanTheory){
    ft.likedBy = fanTheory.likedBy;
    ft.likedBy.push(req.user.email);

    let query = {_id:req.params.id};

    FanArts.update(query, ft, function(err){
      if(err){
        console.log(err);
      }
      else{
        req.flash('success', 'Fan Art liked!');
        res.redirect('/');
      }
    });

  });

});


app.post('/fanArts/addComment/:id', function(req, res){
  let fanFiction = {};
  fanFiction.comments = [];

  FanArts.find({_id:req.params.id}, function(err, ft){
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

      FanArts.update(query, fanFiction, function(err){
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



let fanTheories = require('./routes/fanTheories');
app.use('/fanTheories', fanTheories);

let fanFictions = require('./routes/fanFictions');
app.use('/fanFictions', fanFictions);

//let fanArts = require('./routes/fanArts');
//app.use('/fanArts', fanArts);

let users = require('./routes/users');
app.use('/users', users);

app.listen(3000, function(){
  console.log('Server started at 3000 :)');
});
