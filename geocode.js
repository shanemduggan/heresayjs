// // output :
// [{
// latitude: 48.8698679,
// longitude: 2.3072976,
// country: 'France',
// countryCode: 'FR',
// city: 'Paris',
// zipcode: '75008',
// streetName: 'Champs-Élysées',
// streetNumber: '29',
// administrativeLevels: {
// level1long: 'Île-de-France',
// level1short: 'IDF',
// level2long: 'Paris',
// level2short: '75'
// },
// provider: 'google'
// }]

var fs = require('fs');
var NodeGeocoder = require('node-geocoder');

var options = {
	provider : 'google',
	apiKey : 'AIzaSyDcIb1KF-PhD_-R1NkUiuWpMhftyrJlQck', // for Mapquest, OpenCage, Google Premier
	formatter : null // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);

var locations = fs.readFileSync('marchLocations.json', 'utf8');
locations = JSON.parse(locations);
console.log(locations);
//geoCodeLocations();

var num = 0;
var updatedLocationData = [];
var saveIndex = 200;
requestGeoCode(locations[0], 0);
//requestGeoCode(locations[51], 51)

//function geoCodeLocations() {
function requestGeoCode(location, index) {

	num++
	if (location.address == undefined)
		return;
	if (index == 171)
		return;

	console.log(location.address);
	console.log(index);
	//(function(index) {
	geocoder.geocode(location.address).then(function(res) {

		var nextNum = index + 1;
		//if (nextNum < 6) {
		setTimeout(function() {
			requestGeoCode(locations[nextNum], nextNum);
		}, 5000);
		//}

		console.log(res);
		console.log(index);
		console.log(location.address);
		updatedLocationData.push({
			neightborhood : res[0].extra.neighborhood,
			lat : res[0].latitude,
			lng : res[0].longitude,
			zipcode : res[0].zipcode
		});

		locations[index].formattedAddress = res[0].formattedAddress;
		locations[index].neighborhood = res[0].extra.neighborhood;
		locations[index].lat = res[0].latitude;
		locations[index].lng = res[0].longitude;
		locations[index].zipcode = res[0].zipcode;

		console.log(locations[index]);
		console.log('');

	}).catch(function(err) {
		console.log(err);
		var nextNum = index + 1;
		setTimeout(function() {
			requestGeoCode(locations[nextNum], nextNum);
		}, 5000);
	});
	//})(i);

	if (num == locations.length - 1) {
		console.log('first request completed');
		var json = JSON.stringify(locations);
		var length = locations.length;
		fs.writeFile('marchLocationsFull.json', json, 'utf8', function(err) {
			console.log("File saved with " + length + " entries");
		});
	} else if (index != 0 && index % saveIndex === 0) {
		var percent = index / saveIndex;
		saveFile('marchLocationsFull' + percent + '.json', index);
	} else if (index == 50) {
		saveFile('marchLocationsFull' + index + '.json', index);
	}
}

function saveFile(dir, length) {
	var json = JSON.stringify(locations);
	fs.writeFile(dir, json, 'utf8', function(err) {
		console.log("File saved with " + length + ' entries');
		return;
	});
}

// for (var i = 0; i < locations.length - 1; i++) {
// console.log(locations[i].address);
// (function(i) {
// setTimeout(function() {
// geocoder.geocode(locations[i].address).then(function(res) {
// console.log(res);
// console.log(i);
// console.log(locations[i].address);
// updatedLocationData.push({
// neightborhood : res[0].extra.neighborhood,
// lat : res[0].latitude,
// lng : res[0].longitude,
// zipcode : res[0].zipcode
// });
//
// locations[i].formattedAddress = res[0].formattedAddress;
// locations[i].neighborhood = res[0].extra.neighborhood;
// locations[i].lat = res[0].latitude;
// locations[i].lng = res[0].longitude;
// locations[i].zipcode = res[0].zipcode;
//
// console.log(locations[i]);
// console.log('');
//
// }).catch(function(err) {
// console.log(err);
// });
// }, 1500);
// })(i);
// }
