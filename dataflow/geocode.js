var options = {
	provider : 'google',
	apiKey : 'AIzaSyDcIb1KF-PhD_-R1NkUiuWpMhftyrJlQck',
	formatter : null
};
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder(options);
var fs = require('fs');
require('./locUtils.js')();
require('./utils.js')();

var dateData = getDateData();
var monthName = dateData.monthName;
var requestWait = 10000;
var saveIndex = 50;
var startIndex = 0;
var locationDataDir = '..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsToGeo.json';
createFolderNew('..\\data\\locationdata\\' + monthName);

// step 1 & 2
var locationData = retrieveMonthLocations();
var locations = locationsToGeocode(locationData);

if (!locations) {
	var locations = fs.readFileSync(locationDataDir, 'utf8');
	locations = JSON.parse(locations);
}

console.log('number of locations to be geocoded: ' + (locations.length - startIndex));

// step 3
//requestGeoCode(locations[startIndex], startIndex);

function requestGeoCode(location, index) {
	// will this work with new callback?
	if (location == undefined || location.address == undefined)
		return;
		
	// skip events that have lat/long

	console.log('index: ' + index, '  address pre geocode: ' + location.address);
	geocoder.geocode(location.address).then(function(res) {
		console.log('index: ' + index, '   address post geocode: ' + location.address);

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
		console.log(err);
	});

	if (index == locations.length - 1) {
		console.log('geocoding completed');
		saveFile(locdatadir + monthName + 'LocationsPartialGeo' + startIndex + '-' + index + '.json', index, locations);
		// step 4
			setTimeout(function() {
				createFinalFiles();
			}, 3000); 
	} else if (index % saveIndex === 0 && index != 0)
		saveFile(locdatadir + 'LocationsPartialGeo' + startIndex + '-' + index + '.json', index, locations);

	var nextNum = index + 1;
	setTimeout(function() {
		requestGeoCode(locations[nextNum], nextNum);
	}, requestWait);
}
