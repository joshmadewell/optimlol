define(['durandal/system', 'common/http'], function (system, Api) {
	return function() {
		var self = this;
		var api = new Api();

		self.getSummonersByName = function(names) {
			var promise = system.defer();

			if (typeof(names) === "string") {
				names = [names];
			}

			var test = api.makeRequest('na', 'summoner/by-name', names.join(', '))
				.then(function(result) {
					promise.resolve(result);
				})
				.fail(function(error) {
					promise.reject(error);
				});

			return promise;
		};
	};
});