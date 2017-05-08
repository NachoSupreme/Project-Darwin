var mongoose = require("mongoose");


//Shipping - address,
var ShippingSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    address: String,
    addressApt: String,
    city: String,
    state: String,
    zipcode: String
  });


module.exports = mongoose.model("Shipping", ShippingSchema, "shipping");