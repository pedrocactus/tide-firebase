'use strict';


process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');


var admin = require("firebase-admin");

var serviceAccount = require("./service.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://tide-176bc.firebaseio.com"
});

var db = admin.database();

// a. the action name from the make_name Dialogflow intent
const NAME_ACTION = 'make_coeff';
// b. the parameters that are parsed from the make_name intent
const DATE_ARGUMENT = 'date-time';
const CITY_ARGUMENT = 'geo-city-fr';

exports.sillyNameMaker = functions.https.onRequest((request, response) => {
	const app = new App({
		request,
		response
	});
	console.log('Request headers: ' + JSON.stringify(request.headers));
	console.log('Request body: ' + JSON.stringify(request.body));


	// c. The function that generates the silly name
	function makeName(app) {
		let date = app.getArgument(DATE_ARGUMENT);
		let city = app.getArgument(CITY_ARGUMENT);
		console.log(date);
		console.log(city);
		var ref = db.ref("ports/"+city+"/days");
		db.ref("ports/").remove();
		var refPorts = db.ref("ports/");
		refPorts.on("value", function(snapshot) {
			console.log(snapshot.val());
			console.log(snapshot.key);

		});


		var newDate = date.replace(/-/g ,"");
		console.log(newDate);
		ref.orderByChild("day").equalTo(newDate).once("value", function(snapshot) {

			snapshot.forEach(function(childSnapshot) {
			console.log("titi");
	 	console.log(childSnapshot.key);
	  console.log(childSnapshot.val().coeff);
		var coeffs = childSnapshot.val().coeff
		if ( coeffs.length == 1){
			app.tell('Le coefficient de marée pour '+city +' sera de '+coeffs[0]);
		} else {
			app.tell('Le coefficient de marée pour '+ city+' sera de '+coeffs[0]+' en première partie de journée, puis de '+coeffs[1]+' par la suite');
		}
		console.log("titi");
	 // ...
 });
		  // console.log(snapshot.val());
			//   console.log(snapshot.key());
			// console.log("titi");
			// console.log(snapshot.val().val().coeff);
			// console.log("tto");
			// app.tell('Le coefficient de marée pour ' + city + ' est de '+snapshot.val().coeff);
		});
	}
	// d. build an action map, which maps intent names to functions
	let actionMap = new Map();
	actionMap.set(NAME_ACTION, makeName);


	app.handleRequest(actionMap);
});
