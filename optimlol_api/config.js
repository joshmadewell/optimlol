var config = {};

// Optimlol API
config.optimlol_api = {};
config.optimlol_api.expiredCacheMinutes = 20;
config.optimlol_api.matchHistoryLookBackCount = 30;
config.optimlol_api.allowedOrigins = [
	'http://www.optimlol.com',
	'http://optimlol.com'
]

// Riot API
config.riot_api = {};
config.riot_api.url_prefix = "https://";
config.riot_api.url_midfix = ".api.pvp.net/api/lol/";
config.riot_api.maxMatchHistoryGamesCount = 15;
config.riot_api.staticTypes = {
	champions: "champion?dataById=true&champData=tags&version=5.13.1",
	items: "item",
	masteries: "mastery",
	runes: "rune",
	summonerSpells: "summoner-spell"
}
config.riot_api.versions = {
	champions: "v1.2",
	staticData: "v1.2",
	matchHistory: "v2.2",
	stats: "v1.3",
	summoners: "v1.4",
	leagues: "v2.5"
}

// Logging
config.logging = {};
config.logging.silent = false;
config.logging.filename = "optimlol.log";
config.logging.maxlogfilesize = 1024 * 1024 * 10;
config.logging.log_level = "debug";
config.logging.file_log_level = "info";

config.logging.logLevels = {};
config.logging.logLevels.levels = { debug: 0, info: 1, riotApi: 2, warn: 3, error: 4 };
config.logging.logLevels.colors = { debug: 'blue', info: 'green', riotApi: 'cyan', warn: 'yellow', error: 'red' };

module.exports = config;