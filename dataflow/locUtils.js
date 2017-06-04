// step 1 - create location file - retrieveMonthLocations();
// step 2 - find locations that need geocoding - locationsToGeocode();
// step 3 - geocode events
// step 4 - create full location data file - createFinalFiles();

module.exports = function() {
	this.fs = require('fs');
	this._ = require('underscore');
	require('./utils.js')();
	this.dateData = getDateData();
	this.monthName = dateData.monthName;
	this.crawldatadir = '..\\data\\crawldata\\' + monthName + '\\';
	this.locdatadir = '..\\data\\locationdata\\' + monthName + '\\';
	this.locdir = '..\\data\\locationdata\\';

	this.retrieveMonthLocations = function() {
		var dataFiles = ['laweekly.json', 'discover.json'];
		var allData = [];

		var laweekly = fs.readFileSync(crawldatadir + dataFiles[0], 'utf8');
		var discover = fs.readFileSync(crawldatadir + dataFiles[1], 'utf8');

		laweekly = JSON.parse(laweekly);
		discover = JSON.parse(discover);

		console.log('laweekly length: ' + laweekly.length, 'discover length: ' + discover.length);

		allData = allData.concat(laweekly);
		allData = allData.concat(discover);
		console.log('number of events: ' + allData.length);

		fs.writeFile(crawldatadir + monthName + 'Events.json', JSON.stringify(allData), 'utf8', function(err) {
			console.log('events saved');
		});

		//var json = JSON.stringify(allData);
		fs.writeFile(locdatadir + monthName + 'LocationsPreClean.json', JSON.stringify(allData), 'utf8', function(err) {
			console.log('saved');
		});

		var filteredLocationData = _.filter(allData, function(e) {
			return e.address && e.locationName != "";
		});
		console.log(filteredLocationData.length);

		// could be an issue
		var uniqueLocationData = _.uniq(filteredLocationData, function(m) {
			return m.locationName;
		});

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
		var locationData = [];
		var foundLocs = [];
		var fullMonthData = [];
		var locsToGeocode = [];
		var geocodedLocs = [];
		var numOfLocsFound = 0;
		var numOfLocsToGeo = 0;
		var hasData = 0;

		if (data) {
			var monthlyLocs = data;
		} else {
			// fix this
			//var monthlyLocs = fs.readFileSync(locdatadir + monthName + 'Locations.json', 'utf8');
			monthlyLocs = JSON.parse(monthlyLocs);
		}

		console.log('current months location data length: ' + monthlyLocs.length);

		var marchLocations = fs.readFileSync(locdir + 'marchLocationsGeo.json', 'utf8');
		var aprilLocations = fs.readFileSync(locdir + 'aprilLocationsGeo.json', 'utf8');
		var mayLocations = fs.readFileSync(locdir + 'mayLocationsGeo.json', 'utf8');

		marchLocations = JSON.parse(marchLocations);
		aprilLocations = JSON.parse(aprilLocations);
		mayLocations = JSON.parse(mayLocations);

		locationData = locationData.concat(marchLocations);
		locationData = locationData.concat(aprilLocations);
		locationData = locationData.concat(mayLocations);

		console.log('april location data length: ' + aprilLocations.length);
		console.log('march location data length: ' + marchLocations.length);
		console.log('may location data length: ' + mayLocations.length);
		console.log('all location data length: ' + locationData.length);

		var json = JSON.stringify(locationData);
		fs.writeFile('..\\data\\locationdata\\allLocationsGeo.json', json, 'utf8', function(err) {
			console.log('all locations saved');
		});

		// Changes
		// keep all unique locations in array
		// go through historic data and update objects
		// take the rest and geocode
		// one geocode is done. that is final file

		var newlyGeod = fs.readFileSync('..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsGeo.json', 'utf8');
		newlyGeod = JSON.parse(newlyGeod);
		console.log('newly geod data length: ' + newlyGeod.length);

		var missingLocs = 0;
		newlyGeod.forEach(function(loc) {
			if (loc.lat)
				fullMonthData.push(loc);
			else {
				var foundLocation = _.find(locationData, function(m) {
					return loc.location == m.location;
				});

				if (foundLocation) {
					numOfLocsFound++;
					fullMonthData.push(loc);
				} else {
					locsToGeocode.push(loc);
					numOfLocsToGeo++;
					missingLocs++;
				}
			}
		});

		console.log(newlyGeod.length);
		console.log(fullMonthData.length);
		console.log(missingLocs);

		var uniqueLocationData = _.uniq(monthlyLocs, function(m) {
			return m.location && m.address;
		});

		//console.log('number of full data events: ' + uniqueLocationData.length);

		uniqueLocationData.forEach(function(loc) {
			if (loc.lat)
				console.log(loc);
			else {
				var foundLocation = _.find(locationData, function(m) {
					return loc.location == m.location;
				});

				if (foundLocation) {
					fullMonthData.push(foundLocation);
					numOfLocsFound++;
				} else
					numOfLocsToGeo++;

				foundLocation = undefined;
				foundLocationInNewGeo = undefined;
			}
		});

		console.log('locations newly geod: ' + hasData);
		console.log('locations found: ' + numOfLocsFound);
		console.log('locations to geo: ' + numOfLocsToGeo);

		var json = JSON.stringify(fullMonthData);
		fs.writeFile('..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsFullGeoNew.json', json, 'utf8', function(err) {
			console.log('locations saved');
		});

		var fullLocs = _.filter(fullMonthData, function(e) {
			return e.lat;
		});
		console.log('events that have coords' + fullLocs.length);
		console.log('events missing coords' + (fullMonthData.length - fullLocs.length));

		return fullLocs;
	};

	this.getFullMonthLocationsData = function() {
		var allMonthLocs = [];
		var prevGeod = fs.readFileSync(locdatadir + monthName + 'LocationsPrevGeod.json', 'utf8');
		var locationsGeod = fs.readFileSync(locdatadir + monthName + 'LocationsPartialGeo.json', 'utf8');

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

	this.createFinalFiles = function() {
		var fullLocationData = [];

		// get newly geo'd files
		var newlyGeod = fs.readFileSync('..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsGeo.json', 'utf8');
		newlyGeod = JSON.parse(newlyGeod);
		console.log('newly geod data length: ' + newlyGeod.length);

		// get previously geo'd files
		var prevGeod = fs.readFileSync('..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsPrevGeod.json', 'utf8');
		prevGeod = JSON.parse(prevGeod);
		console.log('previously geod data length: ' + prevGeod.length);

		var allLocs = fs.readFileSync('..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsPostClean.json', 'utf8');
		allLocs = JSON.parse(allLocs);
		console.log('all locations data length: ' + allLocs.length);

		fullLocationData = fullLocationData.concat(newlyGeod);
		fullLocationData = fullLocationData.concat(prevGeod);
		saveFile('..\\data\\locationdata\\' + monthName + 'LocationsGeo.json', fullLocationData.length, fullLocationData);

		//var notFound = 0;
		// allLocs.forEach(function(loc, index) {
		// var locData = _.find(newlyGeod, function(newloc) {
		// return newloc.location = loc.location;
		// });
		//
		// var locData2 = _.find(prevGeod, function(newloc) {
		// return newloc.location = loc.location;
		// });
		//
		// if (locData)
		// allLocs[index] = locData;
		// else if (locData2)
		// allLocs[index] = locData2;
		// else
		// notFound++;
		//
		// locData = undefined;
		// locData2 = undefined;
		// });

		// var fullLocData = [];
		// for (var i = 0; i < allLocs.length; i++) {
		// var loc = allLocs[i].location;
		// var locData = _.find(newlyGeod, function(newloc) {
		// return newloc.location = loc;
		// });
		//
		// if (!locData) {
		// var locData = _.find(prevGeod, function(newloc) {
		// return newloc.location = loc;
		// });
		// }
		//
		// if (i == allLocs.length - 1) {
		// saveFile('..\\data\\locationdata\\' + monthName + 'LocationsGeo.json', fullLocData.length, fullLocData);
		// }
		//
		// if (locData) {
		// console.log(allLocs[i]);
		// console.log(locData);
		// //allLocs[i] = locData;
		// fullLocData.push(locData);
		// } else
		// notFound++;
		//
		// locData = undefined;
		// }

		// console.log('events not found:' + notFound);
		// console.log(allLocs);

		//var json = JSON.stringify(allLocs);
		// fs.writeFile('..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsFullGeo.json', json, 'utf8', function(err) {
		// });
		//
		// fs.writeFile('..\\data\\locationdata\\' + monthName + 'LocationsGeo.json', json, 'utf8', function(err) {
		// });

	};
};

