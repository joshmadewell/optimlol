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

	self.init = function(router) {
		var SummonerController = require('../controllers/summonerController');
		_summonerController = new SummonerController();
		_summonerController.init();
	}
}