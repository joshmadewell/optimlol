define(['durandal/system',
	'durandal/app',
	'dataProviders/summonersDataProvider',
	'dataProviders/shortenedUrlDataProvider',
	'presentationObjects/summonerPresentationObject',
	'common/collectionSorter',
	'singleton/session'],
	function (durandal, app, SummonersDataProvider, ShortenedUrlDataProvider, SummonerPresentationObject, collectionSorter, session) {
	return function() {
		var self = this;
		var NUMBER_OF_SUMMONERS = 5;
		var LOL_KING_URL = "http://www.lolking.net/summoner/{{region}}/{{summoner_id}}";
		var NA_OP_GG_URL = "http://{{region}}.op.gg/summoner/userName={{summoner_name}}";
		var STATUS = {
			UNSET: "unset",
			VALID: "valid",
			INVALID: "invalid",
			VALIDATING: "validating"
		}
		var summonersDataProvider = new SummonersDataProvider();
		var shortenedUrlDataProvider = new ShortenedUrlDataProvider();

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
							if (result.championStats && result.championStats.length) {
								collectionSorter.sort(result.championStats, "gamesPlayed", "descending");
								summoner.championStats = result.championStats;

								var fiveMostPlayed = result.championStats.slice(0, 5);
								collectionSorter.sort(fiveMostPlayed, "performance", "descending");
								summoner.bestPerformanceStats = fiveMostPlayed;
							} else {
								summoner.championStats = [];
							}
							if (result.recentHistory && result.recentHistory.champions) {
								collectionSorter.sort(result.recentHistory.champions, "count", "descending");
							}
							if (summoner.championStats.length > 0) {
								summoner.recentHistory = result.recentHistory;
							} else {
								summoner.recentHistory = [];
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
			var region = self.selectedRegion();
			var summonerName = this.summonerName();

			var summoner = this;
			if (summonerId === "" || summonerId === null || summonerId === undefined) {
				summoner.lolKingUrl("");
				summoner.naOpGgUrl("");
				return;
			} else {
				summoner.lolKingUrl(LOL_KING_URL.replace('{{summoner_id}}', summonerId).replace('{{region}}', region));
				summoner.naOpGgUrl(NA_OP_GG_URL.replace('{{summoner_name}}', summonerName).replace('{{region}}', region));
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

		var _onSummonerStatusUpdated = function(data) {
			if (data !== STATUS.VALIDATING) {
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

				self.shareUrl("");
				self.summonerInputs.sort(_sortingComparator);
				_tagLanes();

				self.summonerInputs.forEach(function(summoner) {
					if (summoner.status() === STATUS.VALID) {
						self.validSummoners.push(summoner);
					}
				});
			}
		};

		var _initializeSummonerInputs = function() {
			for(var x = 0; x < 5; ++x) {
				var summoner = new SummonerPresentationObject();
				summoner.placeholder = "Summoner " + (x + 1);
				summoner.summonerName.subscribe(_onSummonerNameEntered, summoner);
				summoner.summonerId.subscribe(_onSummonerIdUpdated, summoner);
				summoner.status.subscribe(_onSummonerStatusUpdated);
				self.summonerInputs.push(summoner);
			}
		};

		var _tagLanes = function() {
			self.summonerInputs.forEach(function(summoner) {
				var highestCount = 0;
				var laneTag = "";
				for(var lane in summoner.recentHistory.laneStats) {
					var currentLane = summoner.recentHistory.laneStats[lane];
					currentLane.total = currentLane.total || 0;
					if (currentLane.total > highestCount) {
						highestCount = currentLane.total;
						laneTag = lane;
					}
				}

				if (laneTag !== "") {
					summoner.tooltipText = summoner.displayName + " has played " + laneTag + " " + highestCount + " of the last 30 games.";
				}
				summoner.laneTag = laneTag;
			});
		};

		var _setNextAvailabeSummonerInput = function(summonerName) {
			for(var x = 0; x < self.summonerInputs.length; ++x) {
				var currentSummoner = self.summonerInputs[x];
				if (currentSummoner.status() === STATUS.INVALID || currentSummoner.status() === STATUS.UNSET) {
					currentSummoner.summonerName(summonerName);
					break;
				}
			}
		}

		var _foucsShareUrl = function() {
			$('.share-url').focus();
			$('.share-url').select();
		};

		self.parseChatForPlayers  = function() {
			var potentialSummoners = [];
			var chatText = self.chatText();
			var lines = chatText.split('\n');
			var joinedRoomConstants = [
				" joined the room"
			];

			var alreadyEnteredSummoners = self.summonerInputs.map(function(summoner) {
				return summoner.summonerName()
			});

			alreadyEnteredSummoners = alreadyEnteredSummoners.filter(function(summoner) {
				return summoner !== "";
			});

			lines.forEach(function(line) {
				if (line.indexOf(":") !== -1) {
					// if it's a chat message, take the characters before 
					// the first colon...
					var playerName = line.split(":")[0];
					if (potentialSummoners.indexOf(playerName) === -1 && alreadyEnteredSummoners.indexOf(playerName) === -1) {
						potentialSummoners.push(playerName);
					}
				} else {
					// if it's a 'joined the room' message then we need to
					// take the characters before the default message
					for(var x = 0; x < joinedRoomConstants.length; x++) {
						if (line.indexOf(joinedRoomConstants[x]) !== -1) {
							var playerName = line.split(joinedRoomConstants[x])[0];
							if (potentialSummoners.indexOf(playerName) === -1 && alreadyEnteredSummoners.indexOf(playerName) === -1) {
								potentialSummoners.push(playerName);
							}
							break;
						}
					}
				}
			});

			potentialSummoners.forEach(function(potentialSummoner) {
				_setNextAvailabeSummonerInput(potentialSummoner);
			});
		}

		self.summonerInputs = [];
		self.selectedRegion = ko.observable(session.get('region'));
		self.validSummoners = ko.observableArray([]);
		self.chatText = ko.observable("");
		self.shareUrl = ko.observable("");

		self.clearSummonerInputs = function() {
			self.shareUrl("");
			self.validSummoners.removeAll();
			self.summonerInputs.forEach(function(input) {
				input.summonerName("");
				input.displayName = "";
				input.summonerId(null);
				input.status("unset");
				input.lolKingUrl("");
				input.naOpGgUrl("");
				input.laneTag = "";
				input.totalStats = {};
				input.championStats = [],
				input.recentHistory = []
			})
		};

		self.generateUrl = function() {
			var validatedSummoners = self.validSummoners();
			var region = self.selectedRegion();
			var defaultShareUrl = window.location.origin || "http://www.optimlol.com";
			
			if (validatedSummoners.length === 0) {
				self.shareUrl(defaultShareUrl + "/?region=" + region);
				_foucsShareUrl();
			} else {
				var generationObject = {
					region: region,
					summoners: []
				};

				validatedSummoners.forEach(function(summoner) {
					generationObject.summoners.push(summoner.summonerName());
				});

				shortenedUrlDataProvider.generate(generationObject)
					.then(function(generationResult) {
						self.shareUrl(defaultShareUrl + "/" + generationResult.shortUrl);
						_foucsShareUrl();
					})
					.fail(function(error) {
						self.shareUrl(defaultShareUrl + "/?region=" + region);
						_foucsShareUrl();
					})
			}
		};

		self.activate = function(shortUrlValue, queryString) {
			if (window.__gaTracker && typeof window.__gaTracker === 'function') {
				window.__gaTracker('send', 'pageview', '/');
			}

			_initializeSummonerInputs();

			if (queryString) {
				if (queryString.region) {
					self.selectedRegion(queryString.region)
					app.trigger('regionUpdated', queryString.region);
				}
			}

			if (shortUrlValue) {
				shortenedUrlDataProvider.getData(shortUrlValue)
					.then(function(shortUrlData) {
						self.selectedRegion(shortUrlData.region)
						app.trigger('regionUpdated', shortUrlData.region);

						shortUrlData.summoners.forEach(function(summoner) {
							_setNextAvailabeSummonerInput(summoner);
						});
					})
					.fail(function(error) {
						// not really anything to do here
						// maybe tell them the URL was invalid?
					});
			}

			app.on('regionUpdated')
				.then(function(region) {
					self.selectedRegion(region);
					self.validSummoners.removeAll();

					self.summonerInputs.forEach(function(input) {
						var summonerName = input.summonerName();
						if (summonerName !== null || summonerName !== undefined || summonerName !== "") {
							input.summonerName.valueHasMutated();
						}
					});
				});
		};
	}
});