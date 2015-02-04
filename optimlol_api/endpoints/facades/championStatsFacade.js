var q = require('q');

module.exports = function() {
    var self = this;
    var _statsDataProvider = null;

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

    var getRankedStats = function(region, summonerId) {
        var deferred = q.defer();
        _statsDataProvider.getRankedStats(region, summonerId)
            .then(function(stats) {
                deferred.resolve(_prepareStats(stats));
            })
            .fail(function(error) {
                _logger.warn("Got an error while getting stats", Error);
            })

        return deferred;
    };

    var init = function() {

        var Logger = require('../../common/logger');
        _logger = new Logger();

        var StatsDataProvider = require('../persistence/dataProviders/statsDataProvider');
        _statsDataProvider = new StatsDataProvider();
        _statsDataProvider.init();

    };
}