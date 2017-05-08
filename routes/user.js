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

var btCustomerInfo={};



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
            gateway.customer.find(customerInfo.braintree_customerID, function(err, customer) {
              if(err) {
                console.log(err);
              }
              btCustomerInfo = customer;
              // array of PaymentMethod objects
              console.log("BrainTree info: " + JSON.stringify(customer));
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
                User.findByIdAndUpdate(req.user._id, { $set: { braintree_customerID: result.customer.id }}, function (err, res) {
                  if (err) {
                    console.log(err);
                  }
                  console.log("braintree_customerID " + result.customer.id);
                });
              });
          }
        res.render("./personal_account/checkout", {customerInfo: customerInfo, clientToken: clientToken, btCustomer: btCustomerInfo});
        }
    });
  });
});



router.post("/checkout", isLoggedIn, function (req, res) {
  var customerInfo = JSON.parse(req.body.customerInfo);
  var nonceFromTheClient = req.body.payment_method_nonce;
  gateway.transaction.sale({
    amount: customerInfo.amount,
    paymentMethodNonce: nonceFromTheClient,
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
  res.redirect("/");
}

module.exports = router;


//need to create a module to load customer info
//need to create a module to load cart info