module.exports = function(router) {
	var self = this;
	var _summonerController = null;

	var _handleResponse = function(res, status, data) {
		switch (status) {
			case 200:
				return res.status(status).send({ data: data });
			case 404:
				return res.status(status).send({ data: data });
			case 500:
				return res.status(status).send({ data: null });
		}
	}

	router.get('/:region/summoner/by-name/:summonerName', function(req, res) {
		var region = req.params.region;
		var summonerName = req.params.summonerName;
		var result = {
			status: 'failed',
			summonerData: null
		}

		_summonerController.generateSummonerData(region, summonerName)
			.then(function(summoner) {
				_handleResponse(res, 200, summoner);
			})
			.fail(function(error) {
				_handleResponse(res, 500);
			})
	});

	router.get('/:region/summoner/current-game/:summonerId', function(req, res) {
		var region = req.params.region;
		var summonerId = req.params.summonerId;
		var result = {
			status: 'failed',
			data: null
		}

		_summonerController.getCurrentGameData(region, summonerId)
			.then(function(gameData) {
				_handleResponse(res, 200, gameData);
			})
			.fail(function(error) {
				_handleResponse(res, 500);
			});
	});

	self.init = function(router) {
		var SummonerControllerConstructor = require('../controllers/summonerController');
		_summonerController = new SummonerControllerConstructor();
		_summonerController.init();
	}
}