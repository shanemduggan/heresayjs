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
var startIndex = 500;
// change this if not starting from beginning
var locationDataDir = 'crawldata\\may\\mayLocationsToGeo.json';

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
		locations[index].city = res[0].city;
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

	if (index == locations.length - 1) {
		console.log('geocoding completed');
		saveFile(index, 'mayLocationsPartialGeo' + startIndex + '-' + index);
	} else if (index % saveIndex === 0 && index != 0) {
		//var percent = index / saveIndex;
		saveFile(index, 'mayLocationsPartialGeo' + startIndex + '-' + index);
	} else if (index == 50) {
		saveFile(index, 'mayLocationsPartialGeo0-50');
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

