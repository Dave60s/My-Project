const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({

trackingNumber:String,
sender:String,
receiver:String,

currentLocation:String,
status:String,

timeline:[
{
location:String,
status:String,
date:String
}
]

});

module.exports = mongoose.model("Shipment", shipmentSchema);
