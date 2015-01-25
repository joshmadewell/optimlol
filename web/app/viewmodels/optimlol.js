define(['durandal/system', 
	'knockout', 
	'dataProviders/summonersDataProvider',
	'presentationObjects/summonerPresentationObject',
	'common/sort'], 
	function (durandal, ko, SummonersDataProvider, SummonerPresentationObject, sorter) {
	return function() {
		var self = this;
		var NUMBER_OF_SUMMONERS = 5;
		var LOL_KING_URL = "http://www.lolking.net/summoner/na/summoner_id";
		var NA_OP_GG_URL = "http://na.op.gg/summoner/userName=summoner_name";
		var STATUS = {
			UNSET: "unset",
			VALID: "valid",
			INVALID: "invalid",
			VALIDATING: "validating"
		}
		var summonersDataProvider = new SummonersDataProvider();

		var lineDelimiters = [
			":",
			" joined the room"
		];

		var _onSummonerNameEntered = function(summonerName) {
			var summoner = this;
			if (summonerName === "" || summonerName === null || summonerName === undefined) {
				_summonerVerificationFailed(summoner);
			} else {
				summoner.status(STATUS.VALIDATING);
				_getSummonerData(summonerName)
					.then(function(result) {
						if (result.id) {
							summoner.displayName = result.name;
							summoner.championStats = result.championStats;
							if (summoner.championStats && summoner.championStats.length) {
								sorter.sort(summoner.championStats, "performance", "descending");
							}
							summoner.totalStats = result.totalStats;
							summoner.summonerId(result.id);
							summoner.status(STATUS.VALID);
						} else {
							_summonerVerificationFailed(summoner);
						}
					})
					.fail(function() {
						_summonerVerificationFailed(summoner);
					});
			}
		}

		var _summonerVerificationFailed = function(summoner) {
			summoner.summonerId(null);

			if (summoner.summonerName() === "" || summoner.summonerName() === null || summoner.summonerName() === undefined) {
				summoner.status(STATUS.UNSET);
			} else {
				summoner.status(STATUS.INVALID);
			}
		};

		var _onSummonerIdUpdated = function(summonerId) {
			var summoner = this;
			if (summonerId === "" || summonerId === null || summonerId === undefined) {
				summoner.lolKingUrl("");
				summoner.naOpGgUrl("");
				return;
			} else {
				summoner.lolKingUrl(LOL_KING_URL.replace('summoner_id', summonerId));
				summoner.naOpGgUrl(NA_OP_GG_URL.replace('summoner_name', this.summonerName()));
			}
		};

		var _getSummonerData = function(summoner) {
			var region = self.selectedRegion();
			var promise = durandal.defer();
			summonersDataProvider.getSummonerData(region, summoner)
				.then(function(result) {
					promise.resolve(result);
				})
				.fail(function(error) {
					promise.reject(error);
				})

			return promise;
		};

		var _onSummonerStatusUpdated = function() {
			self.validSummoners.removeAll();

			var _sortingComparator = function(a, b) {
				if (!a.totalStats && b.totalStats) {
					return 1;
				} else if (a.totalStats && !b.totalStats) {
					return -1;
				} else if (!a.totalStats && !b.totalStats) {
					return 0;
				} else if (a.totalStats.performance < b.totalStats.performance) {
					return 1;
				} else if (a.totalStats.performance > b.totalStats.performance) {
					return -1;
				} else {
					return 0;
				}
			};

			self.summonerInputs.sort(_sortingComparator);

			self.summonerInputs.forEach(function(summoner) {
				if (summoner.status() === STATUS.VALID) {
					self.validSummoners.push(summoner);
				}
			});
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
					var currentSummoner = self.summonerInputs[x];
					if (currentSummoner.status() === STATUS.INVALID || currentSummoner.status() === STATUS.UNSET) {
						currentSummoner.summonerName(potentialSummoner);
						break;
					}
				}
			});
		}

		self.summonerInputs = [];
		self.selectedRegion = ko.observable("na");
		self.validSummoners = ko.observableArray([]);
		self.chatText = ko.observable("");

		self.activate = function() {
			for(var x = 0; x < 5; ++x) {
				var summoner = new SummonerPresentationObject();
				summoner.placeholder = "Summoner " + (x + 1);
				summoner.summonerName.subscribe(_onSummonerNameEntered, summoner);
				summoner.summonerId.subscribe(_onSummonerIdUpdated, summoner);
				summoner.status.subscribe(_onSummonerStatusUpdated);
				self.summonerInputs.push(summoner);
			}
		};
	}
});