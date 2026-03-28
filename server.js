const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const Shipment = require("./models/shipment");

const app = express();

/* ===============================
   MIDDLEWARE
================================ */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static(path.join(__dirname,"public")));


/* ===============================
   MONGODB CONNECTION
================================ */

mongoose.connect("mongodb+srv://easyadmin:osagie4192@cluster3.syrbi3t.mongodb.net/easywaycourier")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log("Mongo Error:",err));


/* ===============================
   CREATE SHIPMENT
================================ */

app.post("/create-shipment", async (req,res)=>{

try{

const {sender,receiver} = req.body;

if(!sender || !receiver){
return res.json({message:"Sender and receiver required"});
}

const trackingNumber =
"EWC" + Math.floor(Math.random()*1000000) + "NL";

const shipment = new Shipment({

trackingNumber,
sender,
receiver,

origin:"United States",
destination:"Netherlands",

status:"Shipment Picked Up",
currentLocation:"New York, USA",

timeline:[
{
location:"New York, USA",
status:"Shipment Picked Up",
date:new Date().toLocaleString()
}
]

});

await shipment.save();

console.log("Shipment created:", trackingNumber);

res.json(shipment);

}catch(err){

console.log("Create error:",err);
res.status(500).json({message:"Server error"});

}

});


/* ===============================
   TRACK SHIPMENT
================================ */

app.get("/track/:trackingNumber", async (req,res)=>{

try{

const shipment =
await Shipment.findOne({
trackingNumber:req.params.trackingNumber
});

if(!shipment){
return res.json({message:"Tracking number not found"});
}

res.json(shipment);

}catch(err){

console.log("Track error:",err);
res.status(500).json({message:"Server error"});

}

});


/* ===============================
   UPDATE SHIPMENT
================================ */

app.post("/update-status", async (req,res)=>{

try{

console.log("Update request received:", req.body);

const {trackingNumber,location,status} = req.body;

if(!trackingNumber){
return res.json({message:"Tracking number required"});
}

const shipment =
await Shipment.findOne({trackingNumber});

if(!shipment){
return res.json({message:"Shipment not found"});
}

/* UPDATE DATA */

if(location) shipment.currentLocation = location;
if(status) shipment.status = status;

/* ADD HISTORY */

shipment.timeline.push({

location: location || shipment.currentLocation,
status: status || shipment.status,
date:new Date().toLocaleString()

});

await shipment.save();

console.log("Shipment updated:", trackingNumber);

res.json({message:"Shipment updated successfully"});

}catch(err){

console.log("Update error:",err);
res.status(500).json({message:"Server error"});

}

});


/* ===============================
   GET ALL SHIPMENTS (ADMIN)
================================ */

app.get("/admin/shipments", async (req,res)=>{

try{

const shipments = await Shipment.find().sort({_id:-1});

res.json(shipments);

}catch(err){

console.log("Admin list error:",err);
res.status(500).json({message:"Server error"});

}

});


/* ===============================
   DELETE SHIPMENT (ADMIN)
================================ */

app.delete("/delete/:trackingNumber", async (req,res)=>{

try{

await Shipment.deleteOne({
trackingNumber:req.params.trackingNumber
});

res.json({message:"Shipment deleted"});

}catch(err){

console.log("Delete error:",err);
res.status(500).json({message:"Server error"});

}

});


/* ===============================
   DEFAULT ROUTE
================================ */

app.get("/", (req,res)=>{
res.sendFile(path.join(__dirname,"public","index.html"));
});


/* ===============================
   START SERVER
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
