/* =========================================
   GET TRACKING CODE FROM URL
========================================= */

function getTrackingCode(){
const params = new URLSearchParams(window.location.search);
return params.get("code");
}


/* =========================================
   SHIPMENT ROUTE MAP
========================================= */

let map;
let marker;

function initMap(){

if(!document.getElementById("map")) return;

map = L.map("map").setView([40.7128,-40],3);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
maxZoom:18
}).addTo(map);

/* ROUTE LINE */

const route = [
[40.7128,-74.0060],
[45,-30],
[52.3676,4.9041]
];

L.polyline(route,{color:"blue",weight:4}).addTo(map);

/* MARKER */

marker = L.marker([40.7128,-74.0060]).addTo(map);

}


/* =========================================
   TRACK PACKAGE BUTTON
========================================= */

function trackPackage(){

const input = document.getElementById("trackingInput");

if(!input) return;

let trackingNumber = input.value;

if(trackingNumber === ""){
alert("Please enter tracking number");
return;
}

window.location.href = "/track.html?code=" + trackingNumber;

}


/* =========================================
   MOVE TRUCK
========================================= */

function moveTruck(percent){

const truck = document.getElementById("truck");
const progress = document.getElementById("progress");

if(truck) truck.style.left = percent + "%";
if(progress) progress.style.width = percent + "%";

}


/* =========================================
   MOVE PLANE
========================================= */

function movePlane(percent){

const plane = document.getElementById("plane");

if(plane) plane.style.left = percent + "%";

}


/* =========================================
   ACTIVATE TIMELINE
========================================= */

function activateStep(step){

for(let i=1;i<=step;i++){

const el = document.getElementById("step"+i);

if(el) el.classList.add("active");

}

}


/* =========================================
   UPDATE TRACKING
========================================= */

async function updateTracking(){

const code = getTrackingCode();

if(!code) return;

const trackingElement = document.getElementById("trackingNumber");

if(trackingElement)
trackingElement.innerText = "Tracking Number: " + code;


/* GET SHIPMENT FROM SERVER */

let res;
let data;

try{

res = await fetch("/track/" + code);
data = await res.json();

}catch(err){

console.log("Server error");
return;

}

if(data.message){

const statusBox = document.getElementById("status");

if(statusBox)
statusBox.innerHTML = "<b>Tracking number not found</b>";

return;

}


/* SHOW SENDER / RECEIVER */

if(document.getElementById("sender"))
document.getElementById("sender").innerText = data.sender;

if(document.getElementById("receiver"))
document.getElementById("receiver").innerText = data.receiver;


/* USE DATABASE VALUES */

let location = data.currentLocation;
let status = data.status;


/* STATUS BASED ANIMATION */

if(status === "Shipment Picked Up"){

if(marker) marker.setLatLng([40.7128,-74.0060]);

activateStep(1);
moveTruck(10);
movePlane(10);

}

else if(status === "In Transit"){

if(marker) marker.setLatLng([45,-30]);

activateStep(2);
moveTruck(40);
movePlane(45);

}

else if(status === "Arrived Europe Hub"){

if(marker) marker.setLatLng([50,-10]);

activateStep(3);
moveTruck(70);
movePlane(70);

}

else if(status === "Held at Customs"){

if(marker) marker.setLatLng([52.3676,4.9041]);

activateStep(4);
moveTruck(90);
movePlane(85);

const popup = document.getElementById("customsPopup");

if(popup) popup.style.display = "flex";

}

else if(status === "Shipment Flagged"){

activateStep(5);

moveTruck(100);
movePlane(95);

const flagged = document.getElementById("step5");

if(flagged) flagged.classList.add("flagged-alert");

}


/* UPDATE UI */

const locationBox = document.getElementById("location");
const statusBox = document.getElementById("status");

if(locationBox)
locationBox.innerHTML = "<strong>Current Location:</strong> " + location;

if(statusBox)
statusBox.innerHTML = "<strong>Status:</strong> " + status;

}


/* =========================================
   AUTO REFRESH TRACKING
========================================= */

window.onload = function(){

if(document.getElementById("map")){
initMap();
}

if(getTrackingCode()){
updateTracking();
setInterval(() => updateTracking(),5000);
}

};


/* =========================================
   CREATE SHIPMENT (ADMIN)
========================================= */

async function createShipment(){

const sender = document.getElementById("sender").value;
const receiver = document.getElementById("receiver").value;

if(!sender || !receiver){

alert("Please enter sender and receiver");
return;

}

const res = await fetch("/create-shipment",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({sender,receiver})

});

const data = await res.json();

document.getElementById("trackingResult").innerText =
"Tracking Number: " + data.trackingNumber;

}


/* =========================================
   UPDATE SHIPMENT (ADMIN)
========================================= */

async function updateShipment(){

const trackingNumber =
document.getElementById("trackCode").value;

const location =
document.getElementById("adminLocation").value;

const status =
document.getElementById("status").value;

if(!trackingNumber){
alert("Enter Tracking Number");
return;
}

const res = await fetch("/update-status",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
trackingNumber,
location,
status
})

});

const data = await res.json();

alert(data.message);

}


/* =========================================
   CLOSE CUSTOMS POPUP
========================================= */

function closeCustoms(){

const popup = document.getElementById("customsPopup");

if(popup) popup.style.display = "none";

}




