// step 1 - create location file - retrieveMonthLocations();
// step 2 - find locations that need geocoding - locationsToGeocode();
// step 3 - geocode events
// step 4 - create full location data file - createFinalFiles();
// step 5 - pushFiles();

module.exports = function() {
	this.fs = require('fs');
	this._ = require('underscore');
	this.cp = require('child_process');
	require('./utils.js')();
	require('./logUtils.js')();
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

		allData = allData.concat(laweekly);
		allData = allData.concat(discover);

		log('laweekly length: ' + laweekly.length, 'discover length: ' + discover.length, 'info');
		log('total number of events: ' + allData.length, 'info');

		// use util
		//fs.writeFile(crawldatadir + monthName + 'Events.json', JSON.stringify(allData), 'utf8');
		//fs.writeFile(locdatadir + monthName + 'LocsPreClean.json', JSON.stringify(allData), 'utf8');

		saveFile(crawldatadir + monthName + 'Events.json', allData.length, JSON.stringify(allData));
		saveFile(locdatadir + monthName + 'LocsPreClean.json', allData.length, JSON.stringify(allData));

		var filteredLocationData = _.filter(allData, function(e) {
			return e.address && e.locationName != "";
		});

		log('filtered locations: ' + filteredLocationData.length, 'info');

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

		log(locationData[0], 'info');
		log('number of locations post clean: ' + locationData.length, 'info');

		// use util
		//fs.writeFile(locdatadir + monthName + 'LocationsPostClean.json', JSON.stringify(locationData), 'utf8');
		saveFile(locdatadir + monthName + 'LocationsPostClean.json', locationData.length, JSON.stringify(locationData));

		log('step #1 for data flow complete -  retrieving month locations', 'info');
		return locationData;
	};

	this.locationsToGeocode = function(monthlyLocs) {
		var locationData = [];
		var fullMonthData = [];
		var locsToGeocode = [];
		log('step #2 starting...', 'info');
		log('current months location data length: ' + monthlyLocs.length, 'info');

		// create allLocations file dynamically
		// get contents of locdir folder then parse and concat to loc data

		var marchLocations = fs.readFileSync(locdir + 'marchLocationsGeo.json', 'utf8');
		var aprilLocations = fs.readFileSync(locdir + 'aprilLocationsGeo.json', 'utf8');
		var mayLocations = fs.readFileSync(locdir + 'mayLocationsGeo.json', 'utf8');
		var juneLocations = fs.readFileSync(locdir + 'juneLocationsGeo.json', 'utf8');

		marchLocations = JSON.parse(marchLocations);
		aprilLocations = JSON.parse(aprilLocations);
		mayLocations = JSON.parse(mayLocations);
		juneLocations = JSON.parse(juneLocations);

		locationData = locationData.concat(marchLocations);
		locationData = locationData.concat(aprilLocations);
		locationData = locationData.concat(mayLocations);
		locationData = locationData.concat(juneLocations);

		log('april location data length: ' + aprilLocations.length, 'info');
		log('march location data length: ' + marchLocations.length, 'info');
		log('may location data length: ' + mayLocations.length, 'info');
		log('june location data length: ' + juneLocations.length, 'info');
		log('all location data length: ' + locationData.length, 'info');

		// use util
		//fs.writeFile('..\\data\\locationdata\\allLocationsGeo.json', JSON.stringify(locationData), 'utf8');
		saveFile('..\\data\\locationdata\\allLocationsGeo.json', locationData.length, JSON.stringify(locationData));

		var uniqueLocationData = _.uniq(monthlyLocs, function(m) {
			return m.location && m.address;
		});

		log('number of full data events: ' + uniqueLocationData.length, 'info');

		uniqueLocationData.forEach(function(loc) {
			var foundLocation = _.find(locationData, function(m) {
				return loc.location == m.location;
			});

			if (foundLocation)
				fullMonthData.push(foundLocation);
			else
				locsToGeocode.push(loc);
		});

		log('locations found: ' + fullMonthData.length, 'info');
		log('locations to geo: ' + locsToGeocode.length, 'info');

		// use util
		var json = JSON.stringify(fullMonthData);
		// fs.writeFile('..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsPrevGeod.json', json, 'utf8', function(err) {
		// console.log('locations saved');
		// });
		saveFile('..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsPrevGeod.json', fullMonthData.length, JSON.stringify(fullMonthData));

		log('step #2 for data flow completed - found locations to be geocoded', 'info');
		return locsToGeocode;
	};

	this.createFinalFiles = function() {
		log('starting step #4 - create final files', 'info');
		var fullLocationData = [];

		// get newly geo'd files
		var newlyGeod = fs.readFileSync('..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsNewGeod.json', 'utf8');
		newlyGeod = JSON.parse(newlyGeod);
		log('newly geod data length: ' + newlyGeod.length, 'info');

		// get previously geo'd files
		var prevGeod = fs.readFileSync('..\\data\\locationdata\\' + monthName + '\\' + monthName + 'LocationsPrevGeod.json', 'utf8');
		prevGeod = JSON.parse(prevGeod);
		log('previously geod data length: ' + prevGeod.length, 'info');

		fullLocationData = fullLocationData.concat(newlyGeod);
		fullLocationData = fullLocationData.concat(prevGeod);
		saveFile('..\\data\\locationdata\\' + monthName + 'LocationsGeo.json', fullLocationData.length, fullLocationData);
		log('step #4 for data flow completed - final files created', 'info');
	};

	this.pushFiles = function() {
		log('starting step #5 - push files', 'info');

		cp.execSync('xcopy ..\\data\\crawldata\\' + monthName + '\\' + monthName + 'Events.json C:\\Users\\Shane\\Desktop\\HS-GitPage\\app\\data\\crawldata\\' + monthName + ' /Y');
		cp.execSync('xcopy ..\\data\\locationdata\\' + monthName + 'LocationsGeo.json C:\\Users\\Shane\\Desktop\\HS-GitPage\\app\\data\\locationdata\\ /Y');
		cp.exec("gitPush.bat", {
			cwd : 'C:\\Users\\Shane\\Desktop\\HS\\dataflow\\scripts'
		}, function(error, stdout, stderr) {
			if (error)
				log('git push error - ' + error, 'info');
			log(stdout, 'info');
			log(stderr, 'info');
		});

		log('step #5 completed - data files pushed to git', 'info');
		log('data flow has been completed', 'info');
	};

	this.createAllLocsFile = function() {
		var locationData = [];
		var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'november', 'december'];
		var monthNum = new Date().getMonth() + 1;
		for (var i = 0; i < monthNum; i++) {
			var monthLocs = fs.readFileSync(locdir + months[i] + 'LocationsGeo.json', 'utf8');
			monthLocs = JSON.parse(monthLocs);
			locationData = locationData.concat(monthLocs);
			log(months[i] + ' location data length: ' + monthLocs.length, 'info');
		}

		saveFile('..\\data\\locationdata\\allLocationsGeo.json', locationData.length, JSON.stringify(locationData));
		return locationData;
	};
};

