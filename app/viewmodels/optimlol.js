define(['durandal/system', 
	'knockout', 
	'dataProviders/summonersDataProvider',
	'presentationObjects/summonerPresentationObject'], 
	function (durandal, ko, SummonersDataProvider, SummonerPresentationObject) {
	return function() {
		var self = this;
		var NUMBER_OF_SUMMONERS = 5;
		var summonersDataProvider = new SummonersDataProvider();

		var lineDelimiters = [
			":",
			" joined the room"
		];

		var _onSummonerNameEntered = function(data) {
			if (data === "" || data === null || data === undefined) {
					return;
			} else {
				var queriedValue = summoner.summonerName().replace(/ /g, '').toLowerCase();
				_findSummoner(data)
					.then(function(result) {
						summoner.veryifying = false;
						if (result[queriedValue].name.toLowerCase() === summoner.summonerName().toLowerCase()) {
							summoner.verified(true);
							summoner.summonerId = result[queriedValue].id;
						} else {
							summoner.verified(false);
							summoner.summonerId = null;
						}
					})
					.fail(function() {
						summoner.veryifying = false;
						summoner.verified(false);
						summoner.summonerId = null;
					});
			}
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

		var _parseChatForPlayers = function(players) {
			var potentialSummoners = [];
			var chatText = self.chatText();
			var lines = chatText.split('\n');

			var alreadyEnteredSummoners = self.summoners.map(function(summoner) {
				return summoner.summonerName();
			});

			alreadyEnteredSummoners = alreadyEnteredSummoners.filter(function(summoner) {
				return summoner !== "";
			});

			lines.forEach(function(line) {
				lineDelimiters.forEach(function(delimeter) {
					if (line.indexOf(delimeter) !== -1) {
						var playerName = line.split(delimeter)[0];
						if (potentialSummoners.indexOf(playerName) === -1 && alreadyEnteredSummoners.indexOf(playerName) === -1) {
							potentialSummoners.push(playerName);
						} 
					}
				});
			});

			potentialSummoners.forEach(function(potentialSummoner) {
				for(var x = 0; x < self.summoners.length; ++x) {
					if (self.summoners[x].veryifying === false) {
						self.summoners[x].veryifying = true;
						self.summoners[x].summonerName(potentialSummoner);
						break;
					}
				}
			});
		}

		self.summoners = ko.observableArray([]);
		self.chatText = ko.observable("");

		self.activate = function() {
			for(var x = 0; x < NUMBER_OF_SUMMONERS; ++x) {
				var summoner = new SummonerPresentationObject();
				summoner.placeholder = "Summoner " + (x + 1);
//				summoner.summonerName.subscribe(_onSummonerNameEntered);
				self.summoners.push(summoner);
			}
		};
	}
});