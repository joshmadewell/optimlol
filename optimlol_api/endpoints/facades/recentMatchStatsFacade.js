var _dataProvider = null;

var PromiseFactoryConstructor = require('../../common/utilities/promiseFactory');
var _promiseFactory = new PromiseFactoryConstructor();

var _pruneStats = function(matchHistory) {
	matchHistory.data.matches = matchHistory.data.matches.filter(function(match) {
		return match.participants[0].timeline;
	});
}

var _prepareStats = function(matchHistory) {
	var recentStats = { champions: {}, matches: [] };
	var matches = matchHistory.data.matches;

	matches.forEach(function(match) {
		var participants = match.participants[0];
		if (recentStats.champions[participants.championId] === undefined) {
			recentStats.champions[participants.championId] = {};
			recentStats.champions[participants.championId].lanes = [participants.timeline.lane]
			recentStats.champions[participants.championId].count = 1;
			recentStats.champions[participants.championId].kills = participants.stats.kills;
			recentStats.champions[participants.championId].deaths = participants.stats.deaths;
			recentStats.champions[participants.championId].assists = participants.stats.assists;
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
		optimlolMatchHistoryObject.role = participants.timeline.lane;
		optimlolMatchHistoryObject.championId = participants.championId;
		optimlolMatchHistoryObject.winner = participants.stats.winner;
		optimlolMatchHistoryObject.kills = participants.stats.kills;
		optimlolMatchHistoryObject.deaths =participants.stats.deaths;
		optimlolMatchHistoryObject.assists = participants.stats.assists;
		optimlolMatchHistoryObject.champLevel = participants.stats.champLevel;
		recentStats.matches.push(optimlolMatchHistoryObject);
	});

	matchHistory.data = recentStats;
};

var _getRecentStats = function(region, summonerId, type) {
	return _promiseFactory.defer(function(deferredObject) {
		_dataProvider.getData('matchHistory', {region: region, summonerId: summonerId, type: type})
			.then(function(matchHistory) {
				if (matchHistory.data && matchHistory.data.matches) {
					_pruneStats(matchHistory);
					_prepareStats(matchHistory);
					deferredObject.resolve(matchHistory);
				} else {
					deferredObject.resolve(matchHistory);
				}
			})
			.fail(function(error) {
				deferredObject.resolve(error);
			});
	});
};

var _init = function() {
	var DataProviderConstructor = require('../../persistence/dataProvider');
    _dataProvider = new DataProviderConstructor();
    _dataProvider.init();
};

module.exports = function() {
	var self = this;
	self.init = _init;
	self.getRecentStats = _getRecentStats;
}