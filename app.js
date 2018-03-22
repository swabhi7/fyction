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
    FanTheories.find({}, function(err, FanTheories){
      if(err){
        console.log(err);
      }
      else{
        //console.log(FanTheories);
        let totalPages = Math.floor(FanTheories.length / 5 + 1);
        //console.log('Total : ' + totalPages);
        let pageno = 1;
        //FanTheories.reverse();
        /*FanTheories.sort(function(a, b){
          var keyA = new Date(a.dateandtime),
              keyB = new Date(b.dateandtime);
          // Compare the 2 dates
          if(keyA < keyB) return 1;
          if(keyA > keyB) return -1;
          return 0;
      });*/
        FanTheories.sort(function(a,b){
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        return new Date(b.dateandtime) - new Date(a.dateandtime);
        });
        FanTheories.splice(0, (pageno - 1) * 5);
        if(FanTheories.length > 5){
          FanTheories.splice(5, FanTheories.length - 5);
        }
        //console.log(req.query.valid);
        //console.log(req.query.x[0].title);
        //console.log(req.query.x);
        //console.log(req.query.x);
        if(req.query.x){
          let fts = JSON.parse(req.query.x);
          //console.log(fts);
          let tp = Math.floor(fts.length / 5 + 1);
          let pn = req.query.page;
          //fts.reverse();
          fts.sort(function(a,b){
          // Turn your strings into dates, and then subtract them
          // to get a value that is either negative, positive, or zero.
          return new Date(b.dateandtime) - new Date(a.dateandtime);
          });
          //fts.splice(0, (pn - 5) * 5);
          if(fts.length > 5){
            //fts.splice(5, fts.length - 5);
          }
          res.render('index', {
            pageDescription: 'filtered',
            fanTheories: fts,
            errors:false,
            page: pn,
            totalPages: tp
          });
        }
        else{
          res.render('index', {
            pageDescription: 'The Home route',
            fanTheories: FanTheories,
            errors:false,
            page: 1,
            totalPages: totalPages
          });
        }

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

let users = require('./routes/users');
app.use('/users', users);

app.listen(3000, function(){
  console.log('Server started at 3000 :)');
});
