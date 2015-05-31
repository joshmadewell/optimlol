module.exports = function() {
	var self = this;
	var _apiVersion = null;
	var _riotApi = null;
	var _mongoCache = null;
	var _logger = null;
	var _config = null;

	var REQUIRED_PARAMETERS = ['region', 'summonerId'];
	var _parameterValidator = require('../../common/utilities/parameterValidator');

	var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
	var _promiseFactory = new PromiseFactoryConstructor();

	self.hasCache = false;

	self.getFromApi = function(parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error("Invalid parameters for Current Game Data Provider");
		}

		return _promiseFactory.defer(function(deferredObject) {
			_logger.debug("current game data provider, getFromApi");
			console.log(parameters, _config.riot_api);
			var currentGamePath = "observer-mode/rest/consumer/getSpectatorGameInfo/" + _config.riot_api.currentGameRegion[parameters.region] + '/' + parameters.summonerId;
			console.log(currentGamePath, parameters);
			_riotApi.makeRequest(parameters.region, currentGamePath)
				.then(function(currentGameResult) {
					deferredObject.resolve(currentGameResult);
				})
				.fail(function(error) {
					deferredObject.reject(error);
				});
		});
	};

	self.init = function() {
		_config = require('../../config');

		var LoggerConstructor = require('../../common/logging/logger');
		_logger = new LoggerConstructor();

		var RiotApiConstructor = require('../../common/riotApi/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();
	}
};