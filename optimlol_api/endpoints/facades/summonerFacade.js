var q = require('q')
var _summonerDataProvider = null;

var _verifySummoner = function(region, summonerName) {

}

var _init = function() {
	var SummonerDataProvider = require('../../dataProvider/summonerDataProvider');
	_summonerDataProvider = new SummonerDataProvider();
	_summonerDataProvider.init();
}

module.exports = function() {
	var self = this;
	self.init = _init;
	self.verifySummoner = _verifySummoner;
}