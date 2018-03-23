const express = require('express');
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

app.get('*', function(req, res, next){
  console.log('url - '+req.url);
  res.locals.user = req.user || null;
  next();
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


            if(req.query.x){
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
                  totalPages1: 1
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
                  totalPages1: totalPages1
                });

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
                totalPages1: totalPages1
              });
            }

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

let fanTheories = require('./routes/fanTheories');
app.use('/fanTheories', fanTheories);

let fanFictions = require('./routes/fanFictions');
app.use('/fanFictions', fanFictions);

let users = require('./routes/users');
app.use('/users', users);

app.listen(3000, function(){
  console.log('Server started at 3000 :)');
});
