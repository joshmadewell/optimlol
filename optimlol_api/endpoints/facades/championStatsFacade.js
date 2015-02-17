var q = require('q');
var _statsDataProvider = null;
var _performanceCalculator = require('../../common/utilities/performanceCalculator');

var _prepareStats = function(stats) {
    if (stats.data) {
        var optimlolChampions = [];
        stats.data.champions.forEach(function(champion) {
            var optimlolChampion = {};
            optimlolChampion.id = champion.id;
            optimlolChampion.wins = champion.stats.totalSessionsWon;
            optimlolChampion.losses = champion.stats.totalSessionsLost;
            optimlolChampion.kills = champion.stats.totalChampionKills;
            optimlolChampion.deaths = champion.stats.totalDeathsPerSession;
            optimlolChampion.assists = champion.stats.totalAssists;
            if (champion.stats.totalDeathsPerSession) {
                optimlolChampion.kda = (champion.stats.totalChampionKills + champion.stats.totalAssists) / champion.stats.totalDeathsPerSession;
            } else {
                optimlolChampion.kda = (champion.stats.totalChampionKills + champion.stats.totalAssists);
            }
            optimlolChampion.gamesPlayed = champion.stats.totalSessionsPlayed;
            optimlolChampion.performance = _performanceCalculator.calculate(champion.stats.totalSessionsWon, champion.stats.totalSessionsLost);
            optimlolChampions.push(optimlolChampion);
        });

        stats.data.champions = optimlolChampions;
    }

    return stats;
};

var _getRankedStats = function(region, summonerId) {
    var deferred = q.defer();
    _statsDataProvider.getRankedStats({region: region, summonerId: summonerId})
        .then(function(stats) {
            deferred.resolve(_prepareStats(stats));
        })
        .fail(function(error) {
            _logger.warn("Some error while getting stats", error);
            deferred.reject(error);
        })

    return deferred.promise;
};

var _init = function() {
    var Logger = require('../../common/logging/logger');
    _logger = new Logger();

    var StatsDataProviderConstructor = require('../../persistence/dataProviders/statsDataProvider');
    _statsDataProvider = new StatsDataProviderConstructor();
    _statsDataProvider.init();
};

module.exports = function() {
    var self = this;
    self.init = _init;
    self.getRankedStats = _getRankedStats;
}