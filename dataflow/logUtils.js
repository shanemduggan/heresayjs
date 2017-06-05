module.exports = function() {
	this.fs = require('fs');
	//this.$ = require('jquery');
	//this._ = require('underscore');
	//this.types = [];
	this.winston = require('winston');
	require('./utils.js')();
	this.created = false;
	this.logger = undefined;

	this.initialize = function() {
		var tsFormat = new Date().toLocaleTimeString();
		var dateInfo = getDateData();

		fs.writeFileSync('C:\Users\Shane\Desktop\HS\dataflow\log' + dateInfo.monthName + 'Log.log');
		
		logger = new (winston.Logger)({
			transports : [new (winston.transports.File)({
				filename : '../log/juneLog.log',
				timestamp : tsFormat
			})]
		});

		return true;
	};

	this.log = function(msg, level) {
		if (!created)
			created = initialize();

		if (level == 'info')
			logger.info(msg);
			
		// handle objects and strings
	};
};
