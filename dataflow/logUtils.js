module.exports = function() {
	this.fs = require('fs');
	this.winston = require('winston');
	require('./utils.js')();
	this.logger = undefined;

	this.initialize = function(msg, level, type) {
		var dateInfo = getDateData();

		if (type == 'dataFlow')
			var fileName = 'log/' + dateInfo.monthName + 'DataFlow.log';
		else
			var fileName = '../log/' + dateInfo.monthName + 'Crawl.log';

		// https://github.com/winstonjs/winston-daily-rotate-file
		logger = new (winston.Logger)({
			transports : [new (winston.transports.File)({
				filename : fileName,
				timestamp : function() {
					var tzoffset = (new Date()).getTimezoneOffset() * 60000;
					return localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
				}
			})]
		});

		log(msg, level);
	};

	this.log = function(msg, level, type) {
		if (logger == undefined)
			initialize(msg, level, type);
		else {
			if (level == 'info')
				logger.info(msg);
			else if (level == 'error')
				logger.error(msg);
		}
	};
};
