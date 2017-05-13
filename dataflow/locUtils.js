// step 1 - create location file - retrieveMonthLocations();
// step 2 - find locations that need geocoding - locationsToGeocode();
// step 3 - geocode events
// step 4 - create full location data file - getFullMonthLocationsData();

module.exports = function() {
	this.fs = require('fs');
	this._ = require('underscore');
	require('../utils.js')();
	this.dateData = getDateData();
	this.monthName = dateData.monthName;
	this.crawldatadir = '..\\data\\crawldata\\' + monthName + '\\';
	this.locdatadir = '..\\data\\locationdata\\' + monthName + '\\';

	this.retrieveMonthLocations = function() {
		var dataFiles = ['laweekly.json', 'discover.json'];
		var allData = [];

		var laweekly = fs.readFileSync(crawldatadir + dataFiles[0], 'utf8');
		var discover = fs.readFileSync(crawldatadir + dataFiles[1], 'utf8');

		laweekly = JSON.parse(laweekly);
		discover = JSON.parse(discover);

		laweekly = laweekly.events;
		discover = discover.events;

		console.log('laweekly length: ' + laweekly.length, 'discover length: ' + discover.length);

		allData = allData.concat(laweekly);
		allData = allData.concat(discover);
		console.log('number of events: ' + allData.length);

		var json = JSON.stringify(allData);
		fs.writeFile(locdatadir + monthName + 'LocationsPreClean.json', JSON.stringify(allData), 'utf8', function(err) {
			console.log('saved');
		});

		var filteredLocationData = _.filter(allData, function(e) {
			return e.address && e.locationName != "";
		});
		console.log(filteredLocationData.length);
		//console.log(filteredLocationData[0]);

		var uniqueLocationData = _.uniq(filteredLocationData, 'locationName');
		console.log('number of full data events: ' + uniqueLocationData.length);

		var locationData = _.map(uniqueLocationData, function(e) {
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

		console.log(locationData[0]);
		console.log('number of locations: ' + locationData.length);

		var newJson = JSON.stringify(locationData);
		fs.writeFile(locdatadir + monthName + 'LocationsPostClean.json', newJson, 'utf8', function(err) {
		});
		return locationData;
	};

	// loop through each current month location
	// find name in geocoded locations
	// if not, save to new file
	this.locationsToGeocode = function(data) {
		var locsToGeocode = [];
		var geocodedLocs = [];
		var numOfLocsFound = 0;

		if (data) {
			var locationData = data;
		} else {
			var locationData = fs.readFileSync(locdatadir + monthName + 'Locations.json', 'utf8');
			locationData = JSON.parse(locationData);
		}

		console.log('current months location data length: ' + locationData.length);

		var marchLocations = fs.readFileSync(locdatadir + 'marchLocationsGeo.json', 'utf8');
		var aprilLocations = fs.readFileSync(locdatadir + 'aprilLocationsGeo.json', 'utf8');

		marchLocations = JSON.parse(marchLocations);
		aprilLocations = JSON.parse(aprilLocations);

		console.log(' april location data length: ' + aprilLocations.length);
		console.log(' march location data length: ' + marchLocations.length);

		locationData.forEach(function(loc) {
			var foundLocation = _.find(marchLocations, function(m) {
				return loc.location == m.location;
			});

			if (!foundLocation) {
				var foundLocation = _.find(aprilLocations, function(m) {
					return loc.location == m.location;
				});

				if (!foundLocation) {
					locsToGeocode.push(loc);
				} else {
					geocodedLocs.push(foundLocation);
					console.log(foundLocation.location + ' found in april/march data');
					numOfLocsFound++;
				}
			}
		});
		console.log('found ' + numOfLocsFound + ' geocoded locations');
		console.log('locations to geocode ' + locsToGeocode.length);
		var locsToGeo = JSON.stringify(locsToGeocode);
		var geodLocs = JSON.stringify(geocodedLocs);
		fs.writeFile(locdatadir + monthName + '\\' + monthName + 'LocationsToGeo.json', locsToGeo, 'utf8', function(err) {
		});
		fs.writeFile(locdatadir + monthName + '\\' + monthName + 'LocationsPrevGeod.json', geodLocs, 'utf8', function(err) {
		});
		return locsToGeocode;
	};

	// loop through current months location
	// try to find name in march locations
	this.getFullMonthLocationsData = function() {
		var allMonthLocs = [];
		var prevGeod = fs.readFileSync(locdatadir + monthName + '\\' + monthName + 'LocationsPrevGeod.json', 'utf8');
		var locationsGeod = fs.readFileSync(locdatadir + monthName + '\\' + monthName + 'LocationsPartialGeo.json', 'utf8');

		prevGeod = JSON.parse(prevGeod);
		locationsGeod = JSON.parse(locationsGeod);
		console.log('prev geod length: ' + prevGeod.length, 'new geod length: ' + locationsGeod.length);

		allMonthLocs = allMonthLocs.concat(prevGeod);
		allMonthLocs = allMonthLocs.concat(locationsGeod);
		console.log(allMonthLocs.length + ' # of venues');

		var newJson = JSON.stringify(allMonthLocs);
		fs.writeFile(locdatadir + monthName + 'LocationsGeo.json', newJson, 'utf8', function(err) {
			console.log('location data merged');
		});
	};
};

// old getFullMonthLocationData
// var numOfLocsNotFound = 0;
// var aprilLocations = fs.readFileSync('locationdata\\aprilLocationsGeo.json', 'utf8');
// var marchLocations = fs.readFileSync('locationdata\\marchLocationsGeo.json', 'utf8');
// var locationParentData = fs.readFileSync('crawldata\\may\\mayLocations.json', 'utf8');
//
// aprilLocations = JSON.parse(aprilLocations);
// marchLocations = JSON.parse(marchLocations);
// locationParentData = JSON.parse(locationParentData);
//
// console.log('april location data length: ' + aprilLocations.length);
// console.log('march location data length: ' + marchLocations.length);
// console.log('number of location parents: ' + locationParentData.length);
//
// locationParentData.forEach(function(loc) {
// var foundLocationApril = _.find(aprilLocations, function(a) {
// return loc.location == a.location;
// });
//
// if (!foundLocationApril) {
// var foundLocationMarch = _.find(marchLocations, function(m) {
// return loc.location == m.location;
// });
// }
//
// if (foundLocationApril) {
// loc.formattedAddress = foundLocationApril.formattedAddress;
// loc.neighborhood = foundLocationApril.neighborhood;
// loc.lat = foundLocationApril.lat;
// loc.lng = foundLocationApril.lng;
// loc.zipcode = foundLocationApril.zipcode;
// } else if (foundLocationMarch) {
// loc.formattedAddress = foundLocationMarch.formattedAddress;
// loc.neighborhood = foundLocationMarch.neighborhood;
// loc.lat = foundLocationMarch.lat;
// loc.lng = foundLocationMarch.lng;
// loc.zipcode = foundLocationMarch.zipcode;
// } else {
// numOfLocsNotFound++;
// }
// });
// console.log(locationParentData + ' number of geocoded events');
// console.log('unable to find ' + numOfLocsNotFound + ' number of geocoded events');
// var newJson = JSON.stringify(locationParentData);
// fs.writeFile('locationdata\\mayLocationsFullGeo.json', newJson, 'utf8', function(err) {
// });
