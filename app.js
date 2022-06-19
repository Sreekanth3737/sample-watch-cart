const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser=require('body-parser')
let multer=require('multer')
const bcrypt=require('bcrypt');
const session=require('express-session')
const logger = require('morgan');
const hbs=require('express-handlebars');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');

//=======db connection and models
const config=require('./config/config')
const Register=require('./models/userModel')
const Admin_Register=require('./models/adminModel')
const Product=require('./models/productModel')


const app = express();
const fileUpload=require('express-fileupload')


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');app.engine('hbs',hbs.engine({
  extname:'hbs',
  defaultLayout:'layout',
  layoutsDir:__dirname+'/views/layout/',
  partialsDir:__dirname+'/views/partials/'}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(session({secret:"key",cookie:{maxAge:6000000}}))
app.use((req,res,next)=>{
  res.set('Cache-Control','no-store')
  next()
})
app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{layout:false});
});

module.exports = app;
