var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/heresay';
var updatedLocationData = [];

// http://stackoverflow.com/questions/37239839/synchronous-geocoding-in-nodejs
// http://mongodb.github.io/node-mongodb-native/api-generated/collection.html#findandmodify

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

	findLocations(db, function() {
		db.close();
	});

	// insertLocations(db, function() {
	// //findLocations(db, function() {
	// db.close();
	// //});
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

	laweekly = JSON.parse(laweekly);
	discover = JSON.parse(discover);

	laweekly = laweekly.events;
	discover = discover.events;

	console.log(laweekly.length, discover.length);

	allData = allData.concat(laweekly);
	allData = allData.concat(discover);
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
};

var findDocuments = function(db, callback) {
	var collection = db.collection('events03');
	collection.find({}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log("Found the following records");
		//console.log(docs)
		console.log(docs.length);
		callback(docs);
	});
};
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
};

function getSaveTime() {
	var currentdate = new Date();
	var datetime = currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getFullYear() + "-" + currentdate.getHours() + "-" + currentdate.getMinutes() + "-" + currentdate.getSeconds();
	//var datetime = currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getFullYear();
	return datetime;
};

var insertLocations = function(db, callback) {

	//var allData = [];
	var locationData = fs.readFileSync('locationdata\\marchLocationsGeo.json', 'utf8');
	locationData = JSON.parse(locationData);
	console.log(locationData.length);
	var collection = db.collection('locationsgeo03');

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
};

var findLocations = function(db, callback) {
	var collection = db.collection('locationsgeo03');

	collection.find({}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log("Found the following records");
		console.log(docs.length);
		var locationLength = docs.length;
		var badLocations = 0;
		docs.forEach(function(doc) {
			if (!doc.lat) {
				logLocation(doc);
				badLocations++

				// docs.remove({
				// _id : ObjectId(doc._id)
				// }, function(err, result) {
				// if (err)
				// console.log(err);
				// console.log(result);
				// });

			}
		});

		console.log(badLocations);
		callback();
	});

	// db.collection("collection_name").findAndModify({
	// _id : _id
	// }, // query
	// [
	// ], // represents a sort order if multiple matches
	// {
	// $set : data
	// }, // update statement
	// {
	// new : true
	// }, // options - new to return the modified document
	// function(err, doc) {
	// if (err)
	// console.log(err);
	// });

	// working
	// collection.find( { lat : null } ).toArray(function(err, docs) {
	// console.log(docs);
	// console.log(docs.length);
	// });

	// collection.findAndModify({
	// lat : null,
	// remove:true
	// });
	// callback();
};

function logLocation(doc) {
	console.log(doc);
};

function logCoords(coords) {
	console.log(coords);
	console.log(coords.json.results);
};

// function logRecordID(id) {
// console.log(id);
// }

// function geoCodeAddress(address) {
// console.log(address);
// setTimeout(function(address) {
// googleMapsClient.geocode({
// address : address
// }, function(err, response) {
// if (!err) {
// logCoords(response)
// console.log(response.json.results);
// return response.json.results;
// }
// });
// }, 1500);
// }
