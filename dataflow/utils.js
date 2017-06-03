module.exports = function() {
	this.fs = require('fs');
	this.types = [];
	this.saveFile = function(dir, length, obj) {
		var json = JSON.stringify(obj);
		fs.writeFile(dir, json, 'utf8', function(err) {
			console.log("File saved with " + length + ' entries');
			return;
		});
	};

	this.createFolder = function(monthName) {
		if (!fs.existsSync("../../data/crawldata/" + monthName)) {
			console.log('creating folder for ' + monthName + ' crawl data');
			fs.mkdirSync("../../data/crawldata/" + monthName);
		}
	};

	this.createFolderNew = function(dir) {
		if (!fs.existsSync(dir)) {
			//console.log('creating folder for ' + monthName + ' crawl data');
			console.log('creating folder at: ' + dir);
			fs.mkdirSync(dir);
		}
	};

	this.getDateData = function() {
		var monthsArray = [];
		monthsArray[1] = 'january';
		monthsArray[2] = 'february';
		monthsArray[3] = 'march';
		monthsArray[4] = 'april';
		monthsArray[5] = 'may';
		monthsArray[6] = 'june';
		monthsArray[7] = 'july';
		monthsArray[8] = 'august';
		monthsArray[9] = 'september';
		monthsArray[10] = 'october';
		monthsArray[11] = 'november';
		monthsArray[12] = 'december';

		var year = new Date().getFullYear();
		var currentMonth = new Date().getMonth() + 1;
		var currentDay = new Date().getDate();
		var daysInCurrentMonth = new Date(year, currentMonth, 0).getDate();
		var monthName = monthsArray[currentMonth];

		var dateData = {
			year : year,
			currentMonth : currentMonth,
			currentDay : currentDay,
			numOfDays : daysInCurrentMonth,
			monthName : monthName
		};

		return dateData;
	};

	this.logNumOfEvents = function(length) {
		if (length >= 3000)
			console.log('reached 3000 entries');
		if (length >= 5000)
			console.log('reached 5000 entries');
		if (length >= 7000)
			console.log('reached 7000 entries');
		length = 0;
	};

	this.getFilterOption = function(type) {
		if (!type)
			return "Miscellanous";
		if ($.inArray(type, types) == -1) {
			this.types.push(type);
		}

		var miscKeyWords = ['Miscellaneous', 'Other', 'Shopping', 'Community', 'Promotional', 'Activism', 'Spirituality', 'Religion', 'World', 'Competitions', 'Recreation', 'Games'];
		var musicKeyWords = ['Music', 'Alternative', 'Rock', 'DJ', 'EDM', 'House', 'Country', 'Classical', 'Jazz', 'Funk', 'Punk', 'Latin', 'Rap', 'Pop'];
		var sportsKeyWords = ['Sports', 'Basketball', 'Baseball', 'Hockey'];
		var artKeyWords = ['Gallery', 'Galleries', 'Art', 'Arts'];
		var theaterKeyWords = ['Theatre', 'Theater', 'theater'];

		if (type == "")
			return "Miscellaneous";
		var misc = _.filter(miscKeyWords, function(s) {
			return type.indexOf(s) != -1;
		});
		if (misc.length)
			return "Miscellanous";

		var theater = _.filter(theaterKeyWords, function(s) {
			return type.indexOf(s) != -1;
		});
		if (theater.length)
			return "Theater";

		var art = _.filter(artKeyWords, function(s) {
			return type.indexOf(s) != -1;
		});
		if (art.length)
			return "Art";

		var sports = _.filter(sportsKeyWords, function(s) {
			return type.indexOf(s) != -1;
		});
		if (sports.length)
			return "Sports";

		var music = _.filter(musicKeyWords, function(s) {
			return type.indexOf(s) != -1;
		});
		if (music.length)
			return "Music";

		if (type.indexOf('Museum') != -1 || type.indexOf('Museums') != -1)
			return "Museum";
		if (type.indexOf('Dance') != -1 || type.indexOf('Burlesque') != -1 || type.indexOf('Cabaret') != -1)
			return "Dance";
		if (type.indexOf('Holiday') != -1 || type.indexOf('Christmas') != -1 || type.indexOf("New Year's") != -1)
			return "Holidays";
		if (type.indexOf('Film, TV & Radio') != -1 || type.indexOf('film') != -1 || type.indexOf('Film') != -1)
			return "Film & TV";
		if (type.indexOf('Outdoors') != -1)
			return "Outdoors";
		if (type.indexOf('Family') != -1)
			return "Family";
		if (type.indexOf('MuseumsZoosAquariums') != -1)
			return "Nature";
		if (type.indexOf('Food & Drink') != -1)
			return "Food & Drink";
		if (type.indexOf('Comedy') != -1)
			return "Comedy";
		if (type.indexOf('Health') != -1)
			return "Health";
		if (type.indexOf('Festivals') != -1)
			return "Festivals";
		if (type.indexOf('Educational') != -1)
			return "Educational";
		else
			return "Miscellaneous";
	};
};
