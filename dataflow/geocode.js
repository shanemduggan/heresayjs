var options = {
	provider : 'google',
	apiKey : 'AIzaSyDcIb1KF-PhD_-R1NkUiuWpMhftyrJlQck',
	formatter : null
};
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder(options);
var fs = require('fs');
require('./locUtils.js')();
require('../utils.js')();

var dateData = getDateData();
var monthName = dateData.monthName;
// geo options
var requestWait = 10000;
// wait time before next request
var saveIndex = 50;
// define frequency of saving
var startIndex = 301;
// change this if not starting from beginning
var locationDataDir = '..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsToGeo.json';

// run location utils (step 1 & 2)
var locationData = retrieveMonthLocations();
var locations = locationsToGeocode(locationData);

// put this when geocoding is finished
// step 4
//getFullMonthLocationsData();

// get file data
if (!locations) {
	var locations = fs.readFileSync(locationDataDir, 'utf8');
	locations = JSON.parse(locations);
}

console.log('number of locations to be geocoded: ' + (locations.length - startIndex));

// make request (step 3)
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
		locations[index].city = res[0].city;
		if (res[0].extra.neighborhood)
			locations[index].neighborhood = res[0].extra.neighborhood;

		console.log(locations[index]);
		console.log('');

	}).catch(function(err) {
		// this is causing dupliation of calls every error
		console.log(err);
		var nextNum = index + 1;
		setTimeout(function() {
			requestGeoCode(locations[nextNum], nextNum);
		}, requestWait);
	});

	if (index == locations.length - 1) {
		console.log('geocoding completed');
		saveFile(index, '..\\' + monthName + 'LocationsPartialGeo' + startIndex + '-' + index);
	} else if (index % saveIndex === 0 && index != 0)
		saveFile(index, '..\\' + monthName + 'LocationsPartialGeo' + startIndex + '-' + index);
}

// use utils
function saveFile(index, dir) {
	var json = JSON.stringify(locations);
	var length = index - startIndex;
	fs.writeFile(dir + '.json', json, 'utf8', function(err) {
		console.log("File saved with " + length + ' entries');
		return;
	});
}

