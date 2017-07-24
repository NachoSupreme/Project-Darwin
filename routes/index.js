var express = require("express");
var passport = require("passport");
var User  = require("../models/user");
var Shipping = require("../models/shipping");
var router = express.Router({mergeParams: true});


///////////INDEX ROUTES///////////////////
router.get("/", function(req, res){
  res.render("landing");
});


//Show first page of register form
router.get("/signup/user", function(req, res){
  res.render("register");
});
  
  
//Create Route for first register page
router.post("/signup/user", function(req, res){
  var userParams = {
    username: req.body.username,
    personalAccount:req.body.personalAccount,
    businessAccount:req.body.businessAccount
  };
  User.register(new User(userParams), req.body.password, function(err, user){
    if(err){
      console.log(err);
      return res.redirect("/");
    }
    passport.authenticate("local")(req, res, function(){
      res.redirect("/signup/user/shipping");
    });
  });
});
  
//Show second page of register form
router.get("/signup/user/shipping", function(req, res){
    //is user logged in
  if(req.isAuthenticated()){
      res.render("shippingInfo");
  } else {
          console.log("User needs to be logged in");
          res.redirect("back");
    }
});



//Create Route for second register page
router.post("/signup/user/shipping", isLoggedIn, function(req,res){
  var shippingInfo = req.body.shipping;
  var loggedinUser = req.user._id;
  //create shipping information
User.findById(loggedinUser, function(err, foundUser){
      if(err){
        console.log(err);
      } else {
          Shipping.create(shippingInfo, function(err, shippingDetails){
            foundUser.shipping.push(shippingDetails);
            foundUser.save();
            console.log(shippingDetails);
            res.redirect("/myaccount/settings");
          });
        }
    });
});


router.get("/myaccount/settings", isLoggedIn, function(req, res){
  User.findOne({_id: req.user._id}).populate("shipping").exec(function(err, shippingInfo){
    if(err){
      console.log(err);
    } else {
      console.log(shippingInfo);
     res.render("./personal_account/settings", {shippingInfo: shippingInfo});
    }
  });
});

  

//show login form
router.get("/signin",function(req, res){
  res.render("signin");
});


//login
router.post("/signin", passport.authenticate("local",
{
  successRedirect: "/myaccount/checkout",
  failureRedirect: "/signin"
  
}), function(req, res){
});



//Log out
router.get("/signout", function(req, res){
  req.logout();
  req.flash("success", "You are now signed out");
  res.redirect("/");
});


//middleware
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error", "Please Login First!");
  res.redirect("/signin");
}


module.exports = router;

