var express = require("express"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    bodyParser = require("body-parser"),
    User  = require("./models/user"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override");
    passportLocalMongoose = require("passport-local-mongoose");
    
var indexRoutes = require("./routes/index");
var userRoutes = require("./routes/user");
var app = express();

mongoose.connect("mongodb://localhost/magicApp");
app.set("view engine", "ejs");


//Passport Config
app.use(require("express-session")({
  secret: "Charlie does not like squarels",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});



/*Restful Routes*/

app.use(indexRoutes);
app.use("/myaccount", userRoutes);



app.listen(process.env.PORT, process.env.IP, function(){
  console.log("Server is Listening");
});