define(['durandal/system', 'common/optimlolApi'], function (system, OptimlolApi) {
	return function() {
		var self = this;
		var optimlolApi = new OptimlolApi();

		self.getData = function(shortUrl) {
			var promise = system.defer();

			optimlolApi.makeRequest('getUrlData/' + shortUrl)
				.then(function(result) {
					promise.resolve(result.data);
				})
				.fail(function(error) {
					promise.reject(error);
				});

			return promise; 
		};

		self.generate = function(generationObject) {
			var promise = system.defer();
			var query = '?region=' + generationObject.region + "&summoners=" + generationObject.summoners.join(',');

			optimlolApi.makeRequest('generateShortUrl/' + query)
				.then(function(result) {
					promise.resolve(result.data);
				})
				.fail(function(error) {
					promise.reject(error);
				});

			return promise;
		};
	};
});