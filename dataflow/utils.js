module.exports = function() {
	this.fs = require('fs');
	this.saveFile = function(dir, length) {
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
};
