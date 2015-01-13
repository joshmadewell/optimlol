define(['plugins/http', 'durandal/system', 'knockout', 'dataProviders/summonersDataProvider'], function (http, durandal, ko, SummonersDataProvider) {
	return function() {
		var self = this;
		var summonersDataProvider = new SummonersDataProvider();

		var Summoner = function(name) {
			var summoner = {
				value: ko.observable(""),
				placeholder: name,
				verified: ko.observable(false)
			};

			summoner.value.subscribe(function(data) {
				if (data === "" || data === null || data === undefined) {
					return;
				} else {
					var queriedValue = summoner.value().replace(/ /g, '').toLowerCase();
					_findSummoner(data)
						.then(function(result) {
							console.log(result, queriedValue);
							if (result[queriedValue].name.toLowerCase() === summoner.value().toLowerCase()) {
								summoner.verified(true);
							} else {
								summoner.verified(false);
							}

							console.log(self.summoners);
						})
						.fail(function() {
							console.log
							summoner.verified(false);
						});
				}
			});

			return summoner;
		}

		var _findSummoner = function(summoner) {
			var promise = durandal.defer();
            summonersDataProvider.getSummonersByName(summoner)
            	.then(function(result) {
            		promise.resolve(result);
            	})
            	.fail(function(error) {
            		promise.reject(error);
            	})

           	return promise;
		};

		self.summoners = [];

		self.findPlayers = function(players) {
            
		}

		self.activate = function() {
			for(var x = 0; x < 5; ++x) {
				this.summoners.push(new Summoner('Summoner ' + (x + 1)));
			}
		};
	}
});