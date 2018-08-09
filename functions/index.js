'use strict';


process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');


// exports.actionSite = functions.https.onRequest((req, res) => {
// 	res.sendfile('/views/policy.html');
// });

exports.actionSite = functions.https.onRequest((req, res) => {
	res.status(200).send(`<!doctype html>
		<body>
		<h2>Politique de confidentialité de Capitaine Navire</h2>
		<p> Capitaine navire n’utilise et ne demande aucune de vos informations lorsque vous l’utilisez.
		</p>
		</body>
  </html>`);
});

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
const CITY_ARGUMENT = 'port';

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
		console.log(app);
		console.log(date);
		console.log(city);
		var ref = db.ref("ports1/" + city + "/days");
		var newDate = date.replace(/-/g, "");
		console.log(newDate);
		if (newDate.indexOf("2018") > -1) {
			// // db.ref("ports/").remove();
			// var ref2 = db.ref("ports2/");
			// ref2.orderByChild("port").startAt(city.substring(0,3)).once("value", function(snapshot) {
			// 	console.log(snapshot.val());
			// 	console.log(snapshot.key);
			// 	snapshot.forEach(function(childSnapshot) {
			// 		snapshot.forEach(function(childSnapshot) {
			// 	}
			//
			// });

			var refPort = db.ref("entries").orderByChild("value").equalTo(city).once("value", function(snap) {

				snap.forEach(function(chSnap) {
					console.log(chSnap.val());
					var rawCity = chSnap.val().synonyms[0];
					console.log(rawCity);
					ref.orderByChild("day").equalTo(newDate).once("value", function(snapshot) {

						snapshot.forEach(function(childSnapshot) {
							console.log("titi");
							console.log(childSnapshot.key);
							console.log(childSnapshot.val().coeff);
							var speech = "";
							var coeffs = childSnapshot.val().coeff
							if (coeffs.length == 1) {
								speech += 'Le coefficient de marée pour ' + rawCity + ' sera de ' + coeffs[0];
							} else {
								speech += 'Le coefficient de marée pour ' + rawCity + ' sera de ' + coeffs[0] + ' en première partie de journée, puis de ' + coeffs[1] + ' par la suite';
							}

							var hours = childSnapshot.val().hours
							console.log(hours);
							var val1 = [
								[hours[0][0], hours[0][1]],
								[hours[2][0], hours[2][1]]
							];
							console.log(val1);
							var val2 = [
								[hours[1][0], hours[1][1]]
							];
							console.log(val2);
							console.log(hours.length);
							if (hours.length == 4) {
								val2.push([hours[3][0], hours[1][1]]);
							}
							console.log(val2);
							var basseMer = (val1[0][1] < val2[0][1]) ? val1 : val2;
							console.log(basseMer);
							var pleineMer = (val1[0][1] < val2[0][1]) ? val2 : val1;
							console.log(pleineMer);

							speech += '. La mer sera basse à ' + basseMer[0][0] + ' pour une hauteur de ' + basseMer[0][1] + ' mètres';
							if (basseMer.length == 2) {
								speech += ', puis à ' + basseMer[1][0] + ' pour une hauteur de ' + basseMer[1][1] + ' mètres';
							}

							speech += '. La mer sera haute à ' + pleineMer[0][0] + ' pour une hauteur de ' + pleineMer[0][1] + ' mètres';
							if (pleineMer.length == 2) {
								speech += ', puis à ' + pleineMer[1][0] + ' pour une hauteur de ' + pleineMer[1][1] + ' mètres';
							}
							speech += '. Tu as besoin d\'une autre information ?'
							app.ask(speech);
							// ...
						});
					});
				});


				// console.log(snapshot.val());
				//   console.log(snapshot.key());
				// console.log("titi");
				// console.log(snapshot.val().val().coeff);
				// console.log("tto");
				// app.tell('Le coefficient de marée pour ' + city + ' est de '+snapshot.val().coeff);
			});
		} else {
			app.ask('Pour l\'instant, les coefficients de marée sont uniquement disponibles pour l\'année 2018. Tu as besoin d\'une autre information ?');

		}
	}
	// d. build an action map, which maps intent names to functions
	let actionMap = new Map();
	actionMap.set(NAME_ACTION, makeName);


	app.handleRequest(actionMap);
});
