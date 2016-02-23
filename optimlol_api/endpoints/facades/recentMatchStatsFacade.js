var _dataProvider = null;

var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

var _pruneStats = function (matchHistory) {
	matchHistory.data.matches = matchHistory.data.matches.filter(function (match) {
		return match.participants[0].timeline;
	});
}

var _prepareStats = function (matchHistory) {
	var recentStats = { champions: {}, matches: [] };
	var matches = matchHistory.data.matches;

	matches.forEach(function (match) {
		var participants = match.participants[0];
		if (recentStats.champions[participants.championId] === undefined) {
			recentStats.champions[participants.championId] = {};
			recentStats.champions[participants.championId].lanes = [participants.timeline.lane]
			recentStats.champions[participants.championId].count = 1;
			recentStats.champions[participants.championId].kills = participants.stats.kills;
			recentStats.champions[participants.championId].deaths = participants.stats.deaths;
			recentStats.champions[participants.championId].assists = participants.stats.assists;
			recentStats.champions[participants.championId].totalDamageTaken = participants.stats.totalDamageTaken;
			recentStats.champions[participants.championId].sightWardsBoughtInGame = participants.stats.sightWardsBoughtInGame;
			recentStats.champions[participants.championId].wardsKilled = participants.stats.wardsKilled;
			recentStats.champions[participants.championId].visionWardsBoughtInGame = participants.stats.visionWardsBoughtInGame;
			recentStats.champions[participants.championId].totalDamageDealt = participants.stats.totalDamageDealt;
			recentStats.champions[participants.championId].largestKillingSpree = participants.stats.largestKillingSpree;
			recentStats.champions[participants.championId].minionsKilled = participants.stats.minionsKilled;
			recentStats.champions[participants.championId].neutralMinionsKilled = participants.stats.neutralMinionsKilled;
			recentStats.champions[participants.championId].towerKills = participants.stats.towerKills;
			recentStats.champions[participants.championId].goldSpent = participants.stats.goldSpent;
			recentStats.champions[participants.championId].totalDamageDealtToChampions = participants.stats.totalDamageDealtToChampions;
			recentStats.champions[participants.championId].goldEarned = participants.stats.goldEarned;
			recentStats.champions[participants.championId].wardsPlaced = participants.stats.wardsPlaced;
			recentStats.champions[participants.championId].totalTimePlayed = match.matchDuration;
			if (participants.stats.winner) {
				recentStats.champions[participants.championId].wins = 1;
				recentStats.champions[participants.championId].losses = 0;
			} else {
				recentStats.champions[participants.championId].wins = 0;
				recentStats.champions[participants.championId].losses = 1;
			}
		} else {
			recentStats.champions[participants.championId].count++;
			recentStats.champions[participants.championId].kills += participants.stats.kills;
			recentStats.champions[participants.championId].deaths += participants.stats.deaths;
			recentStats.champions[participants.championId].assists += participants.stats.assists;
			recentStats.champions[participants.championId].totalDamageTaken += participants.stats.totalDamageTaken;
			recentStats.champions[participants.championId].sightWardsBoughtInGame += participants.stats.sightWardsBoughtInGame;
			recentStats.champions[participants.championId].wardsKilled += participants.stats.wardsKilled;
			recentStats.champions[participants.championId].visionWardsBoughtInGame += participants.stats.visionWardsBoughtInGame;
			recentStats.champions[participants.championId].totalDamageDealt += participants.stats.totalDamageDealt;
			recentStats.champions[participants.championId].largestKillingSpree += participants.stats.largestKillingSpree;
			recentStats.champions[participants.championId].minionsKilled += participants.stats.minionsKilled;
			recentStats.champions[participants.championId].neutralMinionsKilled += participants.stats.neutralMinionsKilled;
			recentStats.champions[participants.championId].towerKills += participants.stats.towerKills;
			recentStats.champions[participants.championId].goldSpent += participants.stats.goldSpent;
			recentStats.champions[participants.championId].totalDamageDealtToChampions += participants.stats.totalDamageDealtToChampions;
			recentStats.champions[participants.championId].goldEarned += participants.stats.goldEarned;
			recentStats.champions[participants.championId].wardsPlaced += participants.stats.wardsPlaced;
			recentStats.champions[participants.championId].totalTimePlayed += match.matchDuration;
			if (participants.stats.winner) {
				recentStats.champions[participants.championId].wins++;
			} else {
				recentStats.champions[participants.championId].losses++;
			}

			if (recentStats.champions[participants.championId].lanes.indexOf(participants.timeline.lane) === -1) {
				recentStats.champions[participants.championId].lanes.push(participants.timeline.lane);
			}
		}

		var optimlolMatchHistoryObject = {};
		optimlolMatchHistoryObject.matchCreation = match.matchCreation;
		optimlolMatchHistoryObject.lane = participants.timeline.lane;
		optimlolMatchHistoryObject.role = participants.timeline.role;
		optimlolMatchHistoryObject.championId = participants.championId;
		optimlolMatchHistoryObject.winner = participants.stats.winner;
		optimlolMatchHistoryObject.kills = participants.stats.kills;
		optimlolMatchHistoryObject.deaths = participants.stats.deaths;
		optimlolMatchHistoryObject.assists = participants.stats.assists;
		optimlolMatchHistoryObject.champLevel = participants.stats.champLevel;
		recentStats.matches.push(optimlolMatchHistoryObject);
	});

	matchHistory.data = recentStats;
};

var _getRecentStats = function (region, summonerId, type) {
	return _promiseFactory.defer(function (deferredObject) {
		_dataProvider.getData('matchList', { region: region, summonerId: summonerId, type: type, beginIndex: 0, endIndex: 29 })
			.then(function (matchList) {
				var promises = matchList.map(function (matchListObject) {
					return _dataProvider.getData('match', { matchId: matchListObject.matchId });
				});

				_promiseFactory.wait(promises)
					.then(function (results) {
						console.log(results);
					})
					.fail(deferredObject.reject);
			})
			.fail(deferredObject.resolve);
	});
};

var _init = function () {
	var DataProviderConstructor = require('../../persistence/dataProvider');
	_dataProvider = new DataProviderConstructor();
	_dataProvider.init();
};

module.exports = function () {
	var self = this;
	self.init = _init;
	self.getRecentStats = _getRecentStats;
};
