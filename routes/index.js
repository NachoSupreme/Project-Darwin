var express = require("express");
var passport = require("passport");
var braintree = require('braintree');
var User  = require("../models/user");
var Shipping = require("../models/shipping");
var router = express.Router();

var TRANSACTION_SUCCESS_STATUSES = [
  braintree.Transaction.Status.Authorizing,
  braintree.Transaction.Status.Authorized,
  braintree.Transaction.Status.Settled,
  braintree.Transaction.Status.Settling,
  braintree.Transaction.Status.SettlementConfirmed,
  braintree.Transaction.Status.SettlementPending,
  braintree.Transaction.Status.SubmittedForSettlement
];

function formatErrors(errors) {
  var formattedErrors = '';

  for (var i in errors) { // eslint-disable-line no-inner-declarations, vars-on-top
    if (errors.hasOwnProperty(i)) {
      formattedErrors += 'Error: ' + errors[i].code + ': ' + errors[i].message + '\n';
    }
  }
  return formattedErrors;
}

function createResultObject(transaction) {
  var result;
  var status = transaction.status;

  if (TRANSACTION_SUCCESS_STATUSES.indexOf(status) !== -1) {
    result = {
      header: 'Sweet Success!',
      icon: 'success',
      message: 'Your test transaction has been successfully processed. See the Braintree API response and try again.'
    };
  } else {
    result = {
      header: 'Transaction Failed',
      icon: 'fail',
      message: 'Your test transaction has a status of ' + status + '. See the Braintree API response and try again.'
    };
  }

  return result;
}

///////////INDEX ROUTES///////////////////
router.get("/", function(req, res){
  res.render("landing");
});


//Show first page of register form
router.get("/register", function(req, res){
  res.render("register");
});
  
  
//Create Route for first register page
router.post("/register", function(req, res){
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
      res.redirect("/register/shippingInfo");
    });
  });
});
  
//Show second page of register form
router.get("/register/shippingInfo", function(req, res){
    //is user logged in
    if(req.isAuthenticated()){
      res.render("shippingInfo");
    } else {
          console.log("User needs to be logged in");
          res.redirect("/register");
      }
  });


router.post("/register/shippingInfo", isLoggedIn, function(req,res){
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
router.get("/login",function(req, res){
  res.render("login");
});

router.post("/login", passport.authenticate("local",
{
  successRedirect: "/myaccount/checkout",
  failureRedirect: "/login"
  
}), function(req, res){
});



//Log out
router.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});


//middleware
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}


module.exports = router;

