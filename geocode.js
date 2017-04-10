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

var options = {
	provider : 'google',
	apiKey : 'AIzaSyDcIb1KF-PhD_-R1NkUiuWpMhftyrJlQck',
	formatter : null
};
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder(options);
var fs = require('fs');

// geo options
var requestWait = 5000;
// wait time before next request
var saveIndex = 200;
// define frequency of saving
var startIndex = 753;
// change this if not starting from beginning
var locationDataDir = 'crawldata\\april\\aprilLocationsToGeo.json';

// get file data
var locations = fs.readFileSync(locationDataDir, 'utf8');
locations = JSON.parse(locations);
console.log('number of locations to be geocoded: ' + (locations.length - startIndex));

// make request
requestGeoCode(locations[startIndex], startIndex);

function requestGeoCode(location, index) {
	if (location == undefined || location.address == undefined)
		return;

	console.log('index: ' + index, '  address pre geocode: ' + location.address);
	geocoder.geocode(location.address).then(function(res) {
		console.log('index: ' + index, '   address post geocode: ' + location.address);

		var nextNum = index + 1;
		setTimeout(function() {
			requestGeoCode(locations[nextNum], nextNum);
		}, requestWait);

		locations[index].formattedAddress = res[0].formattedAddress;
		locations[index].lat = res[0].latitude;
		locations[index].lng = res[0].longitude;
		locations[index].zipcode = res[0].zipcode;
		if (res[0].extra.neighborhood)
			locations[index].neighborhood = res[0].extra.neighborhood;

		console.log(locations[index]);
		console.log('');

	}).catch(function(err) {
		console.log(err);
		var nextNum = index + 1;
		setTimeout(function() {
			requestGeoCode(locations[nextNum], nextNum);
		}, requestWait);
	});

	if (index != 0) {// save stored data to file
		if (index == locations.length - 1) {
			console.log('geocoding completed');
			saveFile(index, 'aprilLocationsGeo' + startIndex + '-' + index);
		} else if (index % saveIndex === 0) {
			//var percent = index / saveIndex;
			saveFile(index, 'aprilLocationsGeo' + startIndex + '-' + index);
		} else if (index == 50) {
			saveFile(index, 'aprilLocationsGeo0-50');
		}
	}
}

function saveFile(index, dir) {
	var json = JSON.stringify(locations);
	var length = index - startIndex;
	fs.writeFile(dir + '.json', json, 'utf8', function(err) {
		console.log("File saved with " + length + ' entries');
		return;
	});
}

