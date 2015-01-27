var q = require('q');

module.exports = function() {
	var self = this;
	var _config = null;
	var _apiVersion = null;
	var _logger = null
	var _riotApi = null;
	var _mongoCache = null;

	var _getStaticDataApi = function(region, staticType, deferred) {
		var staticDataPath = "static-data/" + region + "/" + _apiVersion + "/" + _config.riot_api.staticTypes[staticType];

		_riotApi.makeRequest(staticDataPath)
			.then(function(staticDataResult) {
				_mongoCache.set('staticData', {region: region, staticType: staticType}, staticDataResult)
					.then(function() {
						deferred.resolve(staticDataResult);
					})
					.fail(function() {
						// if setting cache fails, don't worry, move on.
						deferred.resolve(staticDataResult);
					});
				deffered.resolve(result);
			})
			.fail(function(error) {
				deffered.reject(error);
			});
	};

	self.getStaticData = function(region, staticType) {
		_logger.debug("Getting static data", staticType);
		var deferred = q.defer();
		_mongoCache.get('staticData', {region: region, staticType: staticType})
			.then(function(cachedStaticData) {
				if (cachedStaticData.isExpired === false) {
					_logger.debug("Using cached static data");
					deferred.resolve(cachedStaticData);
				} else {
					_getStaticDataApi(region, staticType, deferred);
				}
			})
			.fail(function(error) {
				_getStaticDataApi(region, staticType, deferred);
			});

		return deferred.promise;
	};

	self.init = function() {
		_config = require('../../config');
		_apiVersion = _config.riot_api.versions.staticData;

		var MongoCache = require('../../common/mongoCache');
		_mongoCache = new MongoCache();

		var Logger = require('../../common/logger');
		_logger = new Logger();

		var RiotApi = require('../../common/riotApi');
		_riotApi = new RiotApi();
		_riotApi.init();
	}
};