define(['durandal/system', 
	'knockout', 
	'dataProviders/summonersDataProvider',
	'presentationObjects/summonerPresentationObject'], 
	function (durandal, ko, SummonersDataProvider, SummonerPresentationObject) {
	return function() {
		var self = this;
		var NUMBER_OF_SUMMONERS = 5;
		var LOL_KING_URL = "http://www.lolking.net/summoner/na/summoner_id";
		var NA_OP_GG_URL = "http://na.op.gg/summoner/userName=summoner_name";
		var summonersDataProvider = new SummonersDataProvider();

		var lineDelimiters = [
			":",
			" joined the room"
		];

		var _onSummonerNameEntered = function(summonerName) {
			var summoner = this;
			if (summonerName === "" || summonerName === null || summonerName === undefined) {
					summoner.isVerified(null);
					return;
			} else {
				summoner.isVerifying(true);
				var queriedValue = summoner.summonerName().replace(/ /g, '').toLowerCase();
				_findSummoner(summonerName)
					.then(function(result) {
						summoner.isVerifying(false);
						if (result[queriedValue].name.toLowerCase() === summoner.summonerName().toLowerCase()) {
							summoner.isVerified(true);
							summoner.summonerId(result[queriedValue].id);
						} else {
							_summonerVerificationFailed(summoner);
						}
					})
					.fail(function() {
						_summonerVerificationFailed(summoner);
					});
			}
		}

		var _onSummonerVerified = function(summonerId) {
			var summoner = this;
			if (summonerName === "" || summonerName === null || summonerName === undefined) {
				summoner.lolKingUrl = "";
				summoner.naOpGgUrl = "";
				return;
			} else {
				summoner.lolKingUrl = LOL_KING_URL.replace('summoner_id', summonerId);
				summoner.naOpGgUrl = NA_OP_GG_URL.replace('summoner_name', this.summonerName());
			}
		};

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

		self.parseChatForPlayers  = function() {
			var potentialSummoners = [];
			var chatText = self.chatText();
			var lines = chatText.split('\n');

			var alreadyEnteredSummoners = self.summonerInputs.map(function(summoner) {
				return summoner.summonerName()
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
				for(var x = 0; x < self.summonerInputs.length; ++x) {
					if (self.summonerInputs[x].isVerifying() === false) {
						self.summonerInputs[x].summonerName(potentialSummoner);
						break;
					}
				}
			});
		}

		self.summonerInputs = [];
		self.chatText = ko.observable("");

		self.activate = function() {
			for(var x = 0; x < 5; ++x) {
				var summoner = new SummonerPresentationObject();
				summoner.placeholder = "Summoner " + (x + 1);
				summoner.summonerName.subscribe(_onSummonerNameEntered, summoner);
				summoner.summonerId(_onSummonerVerified, summoner);
				self.summonerInputs.push(summoner);
			}
		};
	}
});