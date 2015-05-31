module.exports = function() {
	var self = this;
	var _config = null;
	var _apiVersion = null;
	var _logger = null
	var _riotApi = null;
	var _mongoCache = null;

	var REQUIRED_PARAMETERS = ['region', 'staticType'];
	var _parameterValidator = require('../../common/utilities/parameterValidator');

	var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
	var _promiseFactory = new PromiseFactoryConstructor();

	self.hasCache = true;

	self.getFromApi = function(parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error("Invalid parameters for Stats Data Provider"); 
		}

		return _promiseFactory.defer(function(deferredObject) {
			_logger.debug("static data provider, getFromApi");
			var staticDataPath = "api/lol/static-data/" + parameters.region + "/" + _apiVersion + "/" + _config.riot_api.staticTypes[parameters.staticType];
			_riotApi.makeGlobalRequest(parameters.region, staticDataPath)
				.then(function(staticDataResult) {
					_mongoCache.set('staticData', parameters, staticDataResult)
						.then(function() {
							deferredObject.resolve(staticDataResult);
						})
						.fail(function() {
							// if setting cache fails, don't worry, move on.
							deferredObject.resolve(staticDataResult);
						});
					deffered.resolve(result);
				})
				.fail(function(error) {
					deffered.reject(error);
				});
		});
	};

	self.getFromCache = function(parameters) {
		if (_parameterValidator.validate(parameters, REQUIRED_PARAMETERS) === false) {
			throw new Error("Invalid parameters for Stats Data Provider"); 
		}

		return _promiseFactory.defer(function(deferredObject) {
			_logger.debug("static data provider, getFromCache");
			_mongoCache.get('staticData', parameters)
				.then(function(cachedStaticData) {
					deferredObject.resolve(cachedStaticData);
				})
				.fail(function(error) {
					deferredObject.reject(error);
				});
		})
	};

	self.init = function() {
		_config = require('../../config');
		_apiVersion = _config.riot_api.versions.staticData;

		var MongoCacheConstructor = require('../../common/mongo/mongoCache');
		_mongoCache = new MongoCacheConstructor();

		var LoggerConstructor = require('../../common/logging/logger');
		_logger = new LoggerConstructor();

		var RiotApiConstructor = require('../../common/riotApi/riotApi');
		_riotApi = new RiotApiConstructor();
		_riotApi.init();
	}
};