var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');
var url = 'mongodb://localhost:27017/heresay';

MongoClient.connect(url, function(err, db) {
	assert.equal(null, err);
	if (err)
		throw err;
	console.log("Connected successfully to server");

	//insertDocuments(db, function() {
	//findDocuments(db, function() {
	// indexCollection(db, function() {
	//	db.close();
	//
	//});
	//});

	// insertDocuments(db, function() {
	// findDocuments(db, function() {
	// db.close();
	// });
	// });

	// findDocuments(db, function() {
	// db.close();
	// });

	// insertLocations(db, function() {
	// findLocations(db, function() {
	// db.close();
	// });
	// });

	// cleanDocument(db, function() {
	// db.close();
	// });

});

// Returns an object with the following fields:
// result Contains the result document from MongoDB
// ops Contains the documents inserted with added _id fields
// connection Contains the connection used to perform the insert
var insertDocuments = function(db, callback) {
	//collection.insert(docs[[, options], callback])
	var dataFiles = ['laweekly.json', 'discover.json', 'timeout.json'];
	var allData = [];

	var laweekly = fs.readFileSync('crawldata\\march\\' + dataFiles[0], 'utf8');
	var discover = fs.readFileSync('crawldata\\march\\' + dataFiles[1], 'utf8');
	var timeout = fs.readFileSync('crawldata\\march\\' + dataFiles[2], 'utf8');

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

	var collection = db.collection('events03');

	collection.insertMany(allData, function(err, result) {
		assert.equal(err, null);
		console.log("Inserted " + allData.length + " documents into the collection");
		var fileNamePath = 'DBlogs/log' + getSaveTime() + '.txt';
		fs.writeFile(fileNamePath, JSON.stringify(result), function(err) {
			if (err)
				return console.log(err);
		});

		callback();
	});

	// var json = fs.readFileSync('crawldata\\march\\laweekly.json', 'utf8');
	// json = JSON.parse(json);
	// var events = json.events;
	// var collection = db.collection('events03');
	// collection.insertMany(events, function(err, result) {
	// assert.equal(err, null);
	// console.log("Inserted " + events.length + " documents into the collection");
	// var fileNamePath = 'DBlogs/log' + getSaveTime() + '.txt';
	// fs.writeFile(fileNamePath, JSON.stringify(result), function(err) {
	// if (err)
	// return console.log(err);
	// });
	//
	// callback();
	// });
}
var findDocuments = function(db, callback) {
	var collection = db.collection('events03');
	collection.find({}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log("Found the following records");
		//console.log(docs)
		console.log(docs.length);
		callback(docs);
	});
}
// var findDocuments = function(db, callback) {
// var collection = db.collection('events03');
// collection.find({
// 'date' : 'March 31'
// }).toArray(function(err, docs) {
// assert.equal(err, null);
// console.log("Found the following records");
// //console.log(docs);
// console.log(docs.length);
// callback(docs);
// });
// }
var cleanDocument = function(db, callback) {
	db.collection('events03').drop();
	callback();
}
function getSaveTime() {
	var currentdate = new Date();
	var datetime = currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getFullYear() + "-" + currentdate.getHours() + "-" + currentdate.getMinutes() + "-" + currentdate.getSeconds();
	//var datetime = currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getFullYear();
	return datetime;
}

var insertLocations = function(db, callback) {

	// var dataFiles = ['laweekly.json', 'discover.json', 'timeout.json'];
	// var allData = [];
	//
	// var laweekly = fs.readFileSync('..\\crawldata\\march\\' + dataFiles[0], 'utf8');
	// var discover = fs.readFileSync('..\\crawldata\\march\\' + dataFiles[1], 'utf8');
	// var timeout = fs.readFileSync('..\\crawldata\\march\\' + dataFiles[2], 'utf8');
	//
	// laweekly = JSON.parse(laweekly);
	// discover = JSON.parse(discover);
	// timeout = JSON.parse(timeout);
	//
	// laweekly = laweekly.events;
	// discover = discover.events;
	// timeout = timeout.events;
	//
	// console.log(laweekly.length, discover.length, timeout.length);
	//
	// allData = allData.concat(laweekly);
	// allData = allData.concat(discover);
	// allData = allData.concat(timeout);
	// console.log(allData.length);
	// //console.log(allData);
	// //console.log(laweekly);
	//
	// var filteredLocationData = _.filter(allData, function(e) {
	// return e.locationAddress && e.location != "";
	// });
	//
	// console.log(filteredLocationData.length);
	//
	// var locationData = _.map(filteredLocationData, function(e) {
	// var location = e.location;
	// var address = e.locationAddress;
	// if (address.indexOf('CA 9'))
	// address = address.split('CA 9')[0];
	// if (location.indexOf('@') > -1)
	// location = location.replace('@', '').trim();
	// if (address.indexOf('\\') > -1)
	// address = address.replace('\\', '');
	// return {
	// 'location' : location,
	// 'address' : address
	// };
	// });
	//
	// //console.log(locationData);
	// console.log(locationData[0]);
	// console.log(locationData.length);
	//
	// newJson = JSON.stringify(locationData);
	// fs.writeFile('data\\march\\marchLocations.json', newJson, 'utf8', function(err) {
	// });

	var allData = [];
	var locationData = fs.readFileSync('crawldata\\march\\marchLocations.json', 'utf8');
	locationData = JSON.parse(locationData);
	console.log(locationData.length);
	var collection = db.collection('locations03');

	collection.insertMany(locationData, function(err, result) {
		assert.equal(err, null);
		console.log("Inserted " + locationData.length + " documents into the collection");
		var fileNamePath = 'DBlogs/locationlog' + getSaveTime() + '.txt';
		fs.writeFile(fileNamePath, JSON.stringify(result), function(err) {
			if (err)
				return console.log(err);
		});

		callback();
	});
}
var findLocations = function(db, callback) {
	var collection = db.collection('locations03');
	collection.find({}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log("Found the following records");
		//console.log(docs)
		console.log(docs.length);
		callback(docs);
	});
}

