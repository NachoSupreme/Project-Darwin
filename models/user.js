var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

//User - email, name, address, mobile_number; 
var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    personalAccount: Boolean,
    businessAccount: Boolean,
    mobile_number: String,
    braintree_customerID: String,
    shipping: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shipping"
      }
    ]
  });

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);