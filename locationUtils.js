var _ = require('underscore');
var fs = require('fs');

getFullMonthLocationsData();
function getFullMonthLocationsData() {
	// loop through each april location
	// try to find name in march locations
	var numOfLocsNotFound = 0;
	var aprilLocations = fs.readFileSync('locationdata\\aprilLocationsPartialGeo.json', 'utf8');
	var marchLocations = fs.readFileSync('locationdata\\marchLocationsGeo.json', 'utf8');
	var locationParentData = fs.readFileSync('crawldata\\april\\aprilLocations.json', 'utf8');

	aprilLocations = JSON.parse(aprilLocations);
	marchLocations = JSON.parse(marchLocations);
	locationParentData = JSON.parse(locationParentData);

	console.log('april location data length: ' + aprilLocations.length);
	console.log('march location data length: ' + marchLocations.length);
	console.log('number of location parents: ' + locationParentData.length);

	locationParentData.forEach(function(loc) {
		var foundLocationApril = _.find(aprilLocations, function(a) {
			return loc.location == a.location;
		});

		if (!foundLocationApril) {
			var foundLocationMarch = _.find(marchLocations, function(m) {
				return loc.location == m.location;
			});
		}

		if (foundLocationApril) {
			loc.formattedAddress = foundLocationApril.formattedAddress;
			loc.neighborhood = foundLocationApril.neighborhood;
			loc.lat = foundLocationApril.lat;
			loc.lng = foundLocationApril.lng;
			loc.zipcode = foundLocationApril.zipcode;
		} else if (foundLocationMarch) {
			loc.formattedAddress = foundLocationMarch.formattedAddress;
			loc.neighborhood = foundLocationMarch.neighborhood;
			loc.lat = foundLocationMarch.lat;
			loc.lng = foundLocationMarch.lng;
			loc.zipcode = foundLocationMarch.zipcode;
		} else {
			numOfLocsNotFound++
		}
	});
	console.log(locationParentData + ' number of geocoded events');
	console.log('unable to find ' + numOfLocsNotFound + ' number of geocoded events');
	var newJson = JSON.stringify(locationParentData);
	fs.writeFile('locationdata\\aprilLocationsFullGeo.json', newJson, 'utf8', function(err) {
	});
}

//locationsToGeocode();
function locationsToGeocode() {
	// loop through each april location
	// try to find name in march locations
	// if not, save to new file
	var locsToGeocode = [];
	var numOfLocsFound = 0;
	var locationData = fs.readFileSync('crawldata\\april\\aprilLocations.json', 'utf8');
	locationData = JSON.parse(locationData);
	console.log('location data length: ' + locationData.length);

	var marchLocations = fs.readFileSync('locationdata\\marchLocationsGeo.json', 'utf8');
	marchLocations = JSON.parse(marchLocations);
	console.log(' march location data length: ' + marchLocations.length);

	locationData.forEach(function(loc) {
		var foundLocation = _.find(marchLocations, function(m) {
			return loc.location == m.location;
		});

		if (!foundLocation) {
			locsToGeocode.push(loc);
		} else {
			console.log(foundLocation.location + ' found in march data ');
			numOfLocsFound++
		}
	});
	console.log('found ' + numOfLocsFound + ' number of geocoded events');
	console.log('locations to geocode ' + locsToGeocode.length);
	var newJson = JSON.stringify(locsToGeocode);
	fs.writeFile('crawldata\\april\\aprilLocationsToGeo.json', newJson, 'utf8', function(err) {
	});
}

//retrieveMonthLocations();
function retrieveMonthLocations() {
	var dataFiles = ['laweekly.json', 'discover.json'];
	var allData = [];

	var laweekly = fs.readFileSync('crawldata\\april\\' + dataFiles[0], 'utf8');
	var discover = fs.readFileSync('crawldata\\april\\' + dataFiles[1], 'utf8');

	laweekly = JSON.parse(laweekly);
	discover = JSON.parse(discover);

	laweekly = laweekly.events;
	discover = discover.events;

	console.log('laweekly length: ' + laweekly.length, 'discover length: ' + discover.length);

	allData = allData.concat(laweekly);
	allData = allData.concat(discover);
	console.log('number of events: ' + allData.length);

	//console.log(allData);

	var json = JSON.stringify(allData);
	fs.writeFile('crawldata\\april\\aprilLocationsAllData.json', JSON.stringify(allData), 'utf8', function(err) {
		console.log('saved');
	});

	var filteredLocationData = _.filter(allData, function(e) {
		return e.address && e.locationName != "";
	});

	console.log('number of full events: ' + filteredLocationData.length);

	var locationData = _.map(filteredLocationData, function(e) {
		var location = e.locationName;
		var address = e.address;
		if (address.indexOf('CA 9'))
			address = address.split('CA 9')[0];
		if (location.indexOf('@') > -1)
			location = location.replace('@', '').trim();
		if (address.indexOf('\\') > -1)
			address = address.replace('\\', '');
		return {
			'location' : location,
			'address' : address
		};
	});

	//console.log(locationData);
	console.log(locationData[0]);
	console.log('number of locations: ' + locationData.length);

	var newJson = JSON.stringify(locationData);
	fs.writeFile('crawldata\\april\\aprilLocations.json', newJson, 'utf8', function(err) {
	});
}

// var locations = fs.readFileSync('marchLocationsFull.json', 'utf8');
// locations = JSON.parse(locations);
// console.log(locations);
//
// var incompleteLocations = _.filter(locations, function(loc){ return !loc.lat });
//
// console.log(incompleteLocations.length);
