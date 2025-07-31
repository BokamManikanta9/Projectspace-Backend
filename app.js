
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
// const Routes = require("./roters/router2")
const Routes = require("./roters/router1")

const cors= require("cors")
const bodypasrer = require("body-parser")
const mongoose = require("mongoose")
const nodemailer = require("nodemailer");


var app = express();
mongoose.connect("mongodb+srv://chitturiveeravenu:Qf3mblbGdSF3Gigm@cluster0.ncmnrdq.mongodb.net/")
// mongoose.connect("mongodb+srv://manikantabokam9:825Yw6IC5QDkTipG@cluster0.lzvsu.mongodb.net/")
// mongoose.connect("mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.4.0")
.then(result => {
  console.log("Connected")
})
.catch(err => {
  console.log(err)
})


// const port = 5500;
const handlePort = () =>{
  console.log('Port work avthundhi ra')
}
app.use(cors())  
app.use(bodypasrer.json());

app.use("/",Routes);


// app.get("/testing",function(req,res){
//   res.send("<h1>Hi</h1>")
// })

app.listen(5001, handlePort);   

// app.listen(5001, "0.0.0.0", () => {
//   console.log(`Server running on http://0.0.0.0:3000`);
// });


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


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
  res.render('error');
});

module.exports = app;
