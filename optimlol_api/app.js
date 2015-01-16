var express = require('express');
var moment = require('moment');
var winston = require('winston');
var expressRouter = express.Router();

var customLevels = {
	levels: {
		debug: 0,
		info: 1,
		warn: 2,
		error: 3
	},
	colors: {
		debug: 'blue',
		info: 'green',
		warn: 'yellow',
		error: 'red'
	}
}
winston.addColors(customLevels.colors);
var logger = new (winston.Logger)({ 
	levels: customLevels.levels,
	transports: [
		new winston.transports.Console({
			timestamp: function(time) {return moment(time).format('YYYY-MM-DD HH:mm:ss'); },
			level: 'debug',
			colorize: true
		})
	],
	colors: customLevels.colors
});

// apply routes
var routes = new require('./routes')(expressRouter, logger);

var crossOriginMiddleware = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
};

var loggerMiddleware = function(req, res, next) {
	logger.info("HTTP: " + req.method + " - " + res.statusCode + " - " + req.url + " - - HTTP/" + req.httpVersion);
	next();
};

var app = express();
app.use(crossOriginMiddleware);
app.use(loggerMiddleware);
app.use(expressRouter);
app.listen(8080);