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
		var time = new Date().toLocaleString().split(', ')[1].replace(/ /g, '');
		var fileName = '../log/'+ dateInfo.monthName +'Log.log';

		// https://github.com/winstonjs/winston-daily-rotate-file
		logger = new (winston.Logger)({
			transports : [new (winston.transports.File)({
				filename : fileName,
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
		else if (level == 'error')
			logger.error(msg);
	};
};
