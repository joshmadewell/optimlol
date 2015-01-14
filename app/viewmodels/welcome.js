define(['plugins/http', 'durandal/system', 'knockout', 'dataProviders/summonersDataProvider'], function (http, durandal, ko, SummonersDataProvider) {
	return function() {
		var self = this;
		var summonersDataProvider = new SummonersDataProvider();

		var lineDelimiters = [
			":",
			" has joined the room"
		];

		var Summoner = function(name) {
			var summoner = {
				value: ko.observable(""),
				placeholder: name,
				verified: ko.observable(null)
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
		self.chatText = ko.observable("");

		self.findPlayers = function(players) {
			var potentialPlayers = [];
			var chatText = self.chatText();
			var lines = chatText.split('\n');

			lines.forEach(function(line) {
				lineDelimiters.forEach(function(delimeter) {
					if (line.indexOf(delimeter) !== -1) {
						var playerName = line.split(delimeter)[0];
						if (potentialPlayers.indexOf(playerName) === -1) {
							potentialPlayers.push(playerName);
						} 
					}
				});
			});

			console.log(potentialPlayers);
		}

		self.activate = function() {
			for(var x = 0; x < 5; ++x) {
				this.summoners.push(new Summoner('Summoner ' + (x + 1)));
			}
		};
	}
});