module.exports = function() {
	this.fs = require('fs');
	//this.$ = require('jquery');
	//this._ = require('underscore');
	//this.types = [];
	this.winston = require('winston');
	this.created = false;
	this.logger = undefined;

	this.initialize = function() {
		var tsFormat = new Date().toLocaleTimeString();
		var logDir = 'log';
		
		
		//if (!fs.existsSync('path')
		//	fs.mkdirSync('path');

		
		
		logger = new (winston.Logger)({
			transports : [new (winston.transports.File)({
				//filename : tsFormat + 'logfile.log',
				fileName : '${logDir}/juneLog.log',
				timestamp : tsFormat
			})]
		});
		
		created = true;
	};

	this.log = function(msg, level) {
		//if (!created)
		//	initialize();

		//if (level == 'info')
		//	logger.info(msg);

		//created = true;
	};
};
