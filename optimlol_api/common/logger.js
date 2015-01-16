var logger = require('winston');
var moment = require('moment');
var config = require('../config');

logger.setLevels(config.logLevels.levels);
logger.addColors(config.logLevels.colors);
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { level: 'debug', colorize:true, timestamp: function(time) { return moment(time).format('YYYY-MM-DD HH:mm:ss'); }});
module.exports = logger;