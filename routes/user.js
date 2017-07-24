var express = require("express");
var router = express.Router();
var braintree = require('braintree');
var User = require("../models/user");
var bodyParser = require("body-parser");

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: '7j5tvwxx8xgy4ym2',
  publicKey: 'pckb2zfkmyffpnqm',
  privateKey: 'c27277e622f8f51c6255777086a9963c'
});

router.get("/checkout", isLoggedIn, function(req, res){
  gateway.clientToken.generate({}, function (err, response) {
    if(err) {
      console.log(err);
    }
    var clientToken = response.clientToken;
    User.findOne({_id: req.user._id}).populate("shipping").exec(function(err, customerInfo){
      if(err){
        console.log(err);
      } else {
          if(customerInfo.braintree_customerID) {
            //find braintree customerID
            gateway.customer.find(customerInfo.braintree_customerID, function(err, btCustomer) {
              if(err) {
                console.log(err);
              }
              // array of PaymentMethod objects
              console.log("BrainTree info: " + JSON.stringify(btCustomer));
              console.log("Customer Info: " + customerInfo);
              res.render("./personal_account/checkout", {customerInfo: customerInfo, clientToken: clientToken, btCustomer: btCustomer});
            });
          }
          else {
            //create braintree_customerID
            gateway.customer.create({
              firstName: customerInfo.firstname,
              lastName: customerInfo.lastname,
              email: customerInfo.username,
              phone: customerInfo.mobile_number,
            },
            //store braintree_customerID in the database
              function (err, result) {
                if(err) {
                  console.log(err);
                }
                var btResults = result;
                User.findByIdAndUpdate(req.user._id, { $set: { braintree_customerID: result.customer.id }}, function (err, res) {
                  if (err) {
                    console.log(err);
                  }
                  console.log("braintree_customerID " + result.customer.id);
                  
                });
                console.log(customerInfo);
                res.render("./personal_account/checkout", {customerInfo: customerInfo, clientToken: clientToken, btCustomer: btResults});
              });
            
          }
        }
    });
  });
});



 
router.post("/checkout", isLoggedIn, function (req, res) {
  var customerInfo = JSON.parse(req.body.customerInfo);
  console.log("braintree id " + customerInfo.customer.braintree_customerID);
  var nonceFromTheClient = req.body.payment_method_nonce;
  gateway.transaction.sale({
    amount: customerInfo.amount,
    paymentMethodNonce: nonceFromTheClient,
    customerId: customerInfo.customer.braintree_customerID,
    options: {
      submitForSettlement: true,
      storeInVaultOnSuccess: true
    }
  }, 
    function (err, result) {
      if(err) {
        console.log(err);
        res.redirect("settings");
      } else {
          console.log(result.success);
          console.log(result.transaction.customer.id);
        //store order information in DB
        }
    });
  res.redirect("checkout");
});


router.get("/wallet", isLoggedIn, function(req, res){
  res.render("./personal_account/wallet");
});

router.get("/activity", isLoggedIn, function(req, res){
  res.render("./personal_account/activity");
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