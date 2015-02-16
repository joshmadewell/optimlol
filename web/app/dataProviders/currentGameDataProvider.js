define(['durandal/system', 'common/optimlolApi'], function (system, OptimlolApi) {
	return function() {
		var self = this;
		var optimlolApi = new OptimlolApi();

		self.getCurrentGame = function(region, summonerId) {
			var promise = system.defer();
			optimlolApi.makeRequest(region, 'summoner/current-game/' + summonerId)
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