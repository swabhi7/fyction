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

// express-session middleware
app.set('trust proxy', 1); // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

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

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

app.get('/', function(req, res){
  FanTheories.find({}, function(err, FanTheories){
    if(err){
      console.log(err);
    }
    else{
      //console.log(FanTheories);
      res.render('index', {
        pageDescription: 'The Home route',
        fanTheories: FanTheories,
        errors:false
      });
    }
  });
});

let fanTheories = require('./routes/fanTheories');
app.use('/fanTheories', fanTheories);

let users = require('./routes/users');
app.use('/users', users);

app.listen(3000, function(){
  console.log('Server started at 3000 :)');
});
