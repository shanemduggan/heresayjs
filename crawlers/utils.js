var utils = function() {

	this.getMonthName = function(month) {
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

		return monthsArray[month];
	};

	this.createFolder = function() {
		fs.stat("data/" + monthName, function(err, stats) {
			if (err) {
				console.log('Folder doesn\'t exist, so I made the folder ' + err);
				return fs.mkdir("data/" + monthName, callback);
			}
			if (!stats.isDirectory()) {
				callback(new Error('temp is not a directory!'));
			} else {
				console.log('Folder for ' + monthName + ' data exists');
			}
		});
	};

	this.saveFile = function(dir, length) {
		var json = JSON.stringify(obj);
		fs.writeFile(dir, json, 'utf8', function(err) {
			console.log("File saved with " + length + ' entries');
			return;
		});
	};

	this.daysInMonth = function(month, year) {
		return new Date(year, month, 0).getDate();
	};

	this.getDateData = function() {
		var year = new Date().getFullYear();
		var currentMonth = new Date().getMonth() + 1;
		var currentDay = new Date().getDate();
		var daysInCurrentMonth = daysInMonth(currentMonth, year);
		var monthName = getMonthName(currentMonth);
	};

};

module.export = utils;
