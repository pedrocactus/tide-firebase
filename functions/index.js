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
// a. the action name from the make_name Dialogflow intent
const NAME_ACTION = 'make_coeff';
// b. the parameters that are parsed from the make_name intent
const DATE_ARGUMENT = 'date-period';
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
		let number = app.getArgument(DATE_ARGUMENT);
		let city = app.getArgument(CITY_ARGUMENT);
		app.tell('Le coefficient de marée pour ' + city + ' est de 65');
	}
	// d. build an action map, which maps intent names to functions
	let actionMap = new Map();
	actionMap.set(NAME_ACTION, makeName);


	app.handleRequest(actionMap);
});
