var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
let debug = require('debug')('mydebug:app');
var spec = require('./lib/spec');
var routes = require('./routes');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');
var spawn = require('child_process').spawn;
var cronJob = require('cron').CronJob;
var config = require('./config');


// var routes = require('./routes/index');
// var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
 app.use(cookieParser());
    app.use(flash());
    app.use(session({
        resave:true, // don't save session if unmodified
        saveUninitialized:false, //don't create session until something stored
        secret:'Tim'
    }))

// spec(app);



routes(app);

// app.use('/', routes);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var job = new cronJob(config.autoUpdate,function(){
  console.log('开始执行定时更新任务');
  var update = spawn(process.execPath, [path.resolve(__dirname,'update/all.js')]);
 
 update.stdout.pipe(process.stdout);
 update.stderr.pipe(process.stderr);
 update.on('close',function(code){
   console.log('更新任务结束, 代码=%d', code);
 })
})

//job.start();

module.exports = app;
