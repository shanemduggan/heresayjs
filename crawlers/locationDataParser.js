var dataFiles = ['laweekly.json', 'discover.json', 'timeout.json'];
var allData = [];

var laweekly = fs.readFileSync('..\\crawldata\\march\\' + dataFiles[0], 'utf8');
var discover = fs.readFileSync('..\\crawldata\\march\\' + dataFiles[1], 'utf8');
var timeout = fs.readFileSync('..\\crawldata\\march\\' + dataFiles[2], 'utf8');

laweekly = JSON.parse(laweekly);
discover = JSON.parse(discover);
timeout = JSON.parse(timeout);

laweekly = laweekly.events;
discover = discover.events;
timeout = timeout.events;

console.log(laweekly.length, discover.length, timeout.length);

allData = allData.concat(laweekly);
allData = allData.concat(discover);
allData = allData.concat(timeout);
console.log(allData.length);
//console.log(allData);
//console.log(laweekly);

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