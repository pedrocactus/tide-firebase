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
var ref = db.ref("days");

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
		ref.orderByChild("date").equalTo("28/01/2018").once("value", function(snapshot) {

			snapshot.forEach(function(childSnapshot) {
			console.log("titi");
	 console.log(childSnapshot.key);
	  console.log(childSnapshot.val().coeff);
		app.tell('Le coefficient de marée pour ' + city + ' est de '+childSnapshot.val().coeff);
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
