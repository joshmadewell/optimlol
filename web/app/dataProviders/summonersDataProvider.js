define(['durandal/system', 'common/optimlolApi'], function (system, OptimlolApi) {
	return function() {
		var self = this;
		var optimlolApi = new OptimlolApi();

		self.getSummonerData = function(region, name) {
			var promise = system.defer();
			optimlolApi.makeRequest(region, 'summoner/by-name/' + name)
				.then(function(result) {
					promise.resolve(result.data.data);
				})
				.fail(function(error) {
					promise.reject(error);
				});

			return promise;
		};
	};
});