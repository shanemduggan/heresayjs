module.exports = function() {
	this.MongoClient = require('mongodb').MongoClient;
	//this.bodyParser = require('body-parser');
	this._ = require('underscore');
	this.fs = require('fs');
	require('./utils.js')();
	require('./logUtils.js')();
	this.dateData = getDateData();
	this.monthName = dateData.monthName;
	this.connected = false;
	this.db = '';

	this.initialize = function(callback) {
		MongoClient.connect('mongodb://admin:admin@ds155490.mlab.com:55490/sample', function(err, database) {
			if (err)
				return console.log(err);
			db = database;
			connected = true;
			log('connected to mongo client', 'info');
			callback();
		});
	};

	this.getCollection = function(db, collection) {
		db.collection(collection).find().toArray(function(err, result) {
			if (err)
				return console.log(err);

			return result;
		});
	};

	this.saveAsCollection = function() {
		if (!connected)
			initialize(saveAsCollection);
		else {
			var eventData = fs.readFileSync('C:/Users/Shane/Desktop/HS/data/crawldata/' + monthName + '/' + monthName + 'Events.json', 'utf8');
			eventData = JSON.parse(eventData);

			var collection = db.collection('events' + dateData.currentMonth);
			collection.insertMany(eventData, function(err, result) {
				//console.log("Inserted " + eventData.length + " documents into " + monthName + " events collection");
				log('inserted ' + eventData.length + ' documents into ' + monthName + ' events collection', 'info');
			});

			var locData = fs.readFileSync('C:/Users/Shane/Desktop/HS/data/locationdata/' + monthName + 'LocationsGeo.json', 'utf8');
			locData = JSON.parse(locData);

			var collection = db.collection('locations' + dateData.currentMonth);
			collection.insertMany(locData, function(err, result) {
				console.log("Inserted " + locData.length + " documents into " + monthName + " locations collection");
				log('inserted ' + locData.length + ' documents into ' + monthName + ' locations collection', 'info');
				log('step #5 completed - data pushed to git and mongo', 'info')
;			});
		}
	};

};
