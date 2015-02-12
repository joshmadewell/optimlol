var winston = require('winston');
var moment = require('moment');
var config = require('../config');

var logger = new(winston.Logger)({
	levels: config.logging.logLevels.levels,
	transports: [
		new (winston.transports.Console)({
			level: config.logging.log_level,
			prettyPrint: false,
			levels: config.logging.logLevels.levels,
			colorize: true,
			silent: config.logging.silent,
			timestamp: function(time) { 
				return moment(time).format('YYYY-MM-DD HH:mm:ss'); 
			}
		})
		// new(winston.transports.File)({
		// 	filename: config.logging.filename,
		// 	maxsize: config.logging.maxlogfilesize,
		// 	level: config.logging.file_log_level,
		// 	levels: config.logging.logLevels.levels,
		// 	timestamp: function(time) { 
		// 		return moment(time).format('YYYY-MM-DD HH:mm:ss'); 
		// 	}
		// })
	]
});


winston.addColors(config.logging.logLevels.colors);

var Logger = function() {
	if (Logger.prototype._singletonInstance) {
        return Logger.prototype._singletonInstance;
    }

    Logger.prototype._singletonInstance = logger;
    return logger;
}

module.exports = Logger;