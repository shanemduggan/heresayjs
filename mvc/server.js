const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')
const express = require('express');
var _ = require('underscore');
var path = require('path');
var fs = require('fs');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
app.use(bodyParser.urlencoded({
	extended : true
}));

MongoClient.connect('mongodb://admin:admin@ds155490.mlab.com:55490/sample', function(err, database) {
	if (err)
		return console.log(err);
	db = database;
	app.listen(3000, function() {
		console.log('listening on 3000')
	});
});

app.get('/', function(req, res) {

	db.collection('locationsgeo03').find().toArray(function(err, result) {
		if (err)
			return console.log(err);
		res.render('\index.ejs', {
			locations : result
		});
		console.log(result.length);
	});

	// db.collection('events03').find().toArray(function(err, result) {
	// if (err)
	// return console.log(err);
	// // var filteredEvents = _.filter(result, function(e) {
	// // return e.date = "March 30" && e.location != "";
	// // });
	// //console.log(result.length);
	// var filteredEvents = _.reject(result, function(e) {
	// return e.date != "March 30";
	// });
	// //console.log(filteredEvents.length);
	// // res.render('\index.ejs', {
	// // events : filteredEvents
	// // });
	//
	// var fullEvents = []
	// filteredEvents.forEach(function(e) {
	// if (e.location) {
	// if (e.location.indexOf('@') != -1)
	// var loc = e.location.replace('@', '').trim();
	// else
	// var loc = e.location;
	// //console.log(loc);
	//
	// db.collection('locationsgeo03').find({
	// "location" : loc
	// }).toArray(function(err, result) {
	// if (err)
	// console.log(err);
	// if (result != []) {
	// if (result[0].lat) {
	// console.log(result.length + ' results for ' + e.name);
	// //e.lat = result[0].lat;
	// //e.formAddress = result[0].formattedAddress;
	// fullEvents.push({
	// 'name' : e.name,
	// 'lat' : result[0].lat,
	// 'address' : result[0].formattedAddress
	// });
	// //console.log(e);
	// }
	// }
	// });
	// }
	// });
	//
	// // var final = _.reject(filteredEvents, function(e) {
	// // return e.lat = undefined;
	// // });
	//
	// console.log(fullEvents);
	//
	// //var final = _.find(filteredEvents, function(e){ return e.lat != undefined});
	//
	// //console.log(final);
	// //console.log(final[0]);
	//
	// res.render('\index.ejs', {
	// events : fullEvents
	// });
	//
	// // collection.find({ '_id' : o_id }, function(err, cursor) {
	// // cursor.toArray(callback);
	// // db.close();
	// // });
	// });

});

// app.post('/quotes', function(req, res) {
// db.collection('quotes').save(req.body, function(err, result) {
// if (err)
// return console.log(err);
//
// console.log('saved to database');
// res.redirect('/');
// });
// });

app.post('/saveEvents', function(req, res) {

	//var dataFiles = ['laweekly.json', 'discover.json'];
	//var allData = [];

	//var laweekly = fs.readFileSync('C:/Users/Shane/Desktop/HS/crawldata/april/' + dataFiles[0], 'utf8');
	//var discover = fs.readFileSync('C:/Users/Shane/Desktop/HS/crawldata/april/' + dataFiles[1], 'utf8');

	//laweekly = JSON.parse(laweekly);
	//discover = JSON.parse(discover);

	//laweekly = laweekly.events;
	//discover = discover.events;

	//console.log(laweekly.length, discover.length);

	//allData = allData.concat(laweekly);
	//allData = allData.concat(discover);
	//console.log(allData.length);
	
	var allData = fs.readFileSync('C:/Users/Shane/Desktop/HS/crawldata/april/aprilLocationsAllData.json', 'utf8');
	allData = JSON.parse(allData);

	allData.forEach(function(event) {
		if (event.locationName.indexOf('@') > -1)
			event.locationName.replace('@', '').trim();
	});

	var collection = db.collection('events04');
	collection.insertMany(allData, function(err, result) {
		console.log("Inserted " + allData.length + " documents into the collection");
	});

	res.redirect('/');

});

// app.post('/saveLocations', function(req, res) {
// var locationData = fs.readFileSync('C:/Users/Shane/Desktop/HS/locationdata/aprilLocationsFullGeo.json', 'utf8');
// locationData = JSON.parse(locationData);
// console.log(locationData.length);
// var collection = db.collection('locationsgeo04');
//
// collection.insertMany(locationData, function(err, result) {
// console.log("Inserted " + locationData.length + " documents into the collection");
// });
//
// res.redirect('/');
// });

// app.get('/', function(req, res) {
// db.collection('quotes').find().toArray(function(err, result) {
// if (err)
// return console.log(err);
// res.render('\index.ejs', {
// quotes : result
// });
// });
// });

