var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash"),
    User  = require("./models/user"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override");
    
var indexRoutes = require("./routes/index");
var userRoutes = require("./routes/user");
var app = express();

mongoose.connect("mongodb://localhost/magicApp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());




//Passport Config
app.use(require("express-session")({
  secret: "Charlie does not like squarels",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});



/*Restful Routes*/

app.use(indexRoutes);
app.use("/myaccount", userRoutes);





app.listen(process.env.PORT, process.env.IP, function(){
  console.log("Server is Listening");
});