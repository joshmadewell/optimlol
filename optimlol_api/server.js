var express = require('express');
var moment = require('moment');

var Logger = require('./common/logger');
var logger = new Logger();

var Mongo = require('./common/mongo');
var mongo = new Mongo();
mongo.init();

var config = require('./config');

var expressRouter = express.Router();
var SummonerRoutes = require('./endpoints/routes/summonerRoutes');
var summonerRoutes = new SummonerRoutes(expressRouter);
summonerRoutes.init();

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
app.use(function(req, res, next) {
	res.status(404).send("That's not nice of you.");
});
app.listen(process.env.PORT);