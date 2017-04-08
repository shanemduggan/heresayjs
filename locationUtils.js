var _ = require('underscore');
var fs = require('fs');

// var locations = fs.readFileSync('marchLocationsFull.json', 'utf8');
// locations = JSON.parse(locations);
// console.log(locations);
//
// var incompleteLocations = _.filter(locations, function(loc){ return !loc.lat });
//
// console.log(incompleteLocations.length);

var dataFiles = ['laweekly.json', 'discover.json'];
var allData = [];

var laweekly = fs.readFileSync('crawlers\\april\\' + dataFiles[0], 'utf8');
var discover = fs.readFileSync('crawlers\\april\\' + dataFiles[1], 'utf8');

laweekly = JSON.parse(laweekly);
discover = JSON.parse(discover);

laweekly = laweekly.events;
discover = discover.events;

console.log(laweekly.length, discover.length);

allData = allData.concat(laweekly);
allData = allData.concat(discover);
console.log(allData.length);

var filteredLocationData = _.filter(allData, function(e) {
	return e.locationAddress && e.location != "";
});

console.log(filteredLocationData.length);

var locationData = _.map(filteredLocationData, function(e) {
	var location = e.location;
	var address = e.locationAddress;
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
console.log(locationData.length);

newJson = JSON.stringify(locationData);
fs.writeFile('data\\march\\marchLocations.json', newJson, 'utf8', function(err) {
});
