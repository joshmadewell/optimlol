var express = require('express');
var moment = require('moment');
var bodyParser = require('body-parser');

var Logger = require('./common/logging/logger');
var logger = new Logger();

var Mongo = require('./common/mongo/mongo');
var mongo = new Mongo();
mongo.init();

var config = require('./config');

var expressRouter = express.Router();
var routes = [
	'./endpoints/routes/summonerRoutes',
	'./endpoints/routes/shortenUrlRoutes'
];

routes.forEach(function(route) {
	var RouteConstructor = require(route);
	var routeInstance = new RouteConstructor(expressRouter);
	routeInstance.init();
});

var crossOriginMiddleware = function(req, res, next) {
	if (app.get('env') === 'development') {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET');
		res.header('Access-Control-Allow-Headers', 'Content-Type');
	} else if (app.get('env') === 'production') {
		if (req.headers.origin && config.optimlol_api.allowedOrigins.indexOf(req.headers.origin) !== -1) {
			res.header('Access-Control-Allow-Origin', req.headers.origin);
			res.header('Access-Control-Allow-Methods', 'GET');
			res.header('Access-Control-Allow-Headers', 'Content-Type');
		}
	}

	next();
};

var loggerMiddleware = function(req, res, next) {
	logger.info("HTTP: " + req.method + " - " + res.statusCode + " - " + req.url + " - - HTTP/" + req.httpVersion);
	next();
};

var app = express();
app.use(crossOriginMiddleware);
app.use(bodyParser.json());
app.use(loggerMiddleware);
app.use(expressRouter);
app.use(function(req, res, next) {
	res.status(404).send("That's not nice of you.");
});
app.listen(process.env.PORT);