var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('connect-flash');


function spec(app){
    app.use(cookieParser());
    app.use(flash());
    app.use(session({
        resave:true, // don't save session if unmodified
        saveUninitialized:false, //don't create session until something stored
        secret:'Tim'
    }))
}


module.exports = spec;

