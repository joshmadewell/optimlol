module.exports = function(router) {
	var self = this;

	var _shortenedUrlModel = null;

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

	var UrlDataResponseObject = function() {
		this.region = null;
		this.summoners = [];
	}

	router.get('/getUrlData/:urlId', function(req, res) {
		var urlId = req.params.urlId;
		var responseObject = new UrlDataResponseObject();
		_shortenedUrlModel.findOne(function(error, result) {
			if (error) _handleResponse(res, 500);
			else {
				if (result) {
					responseObject.region = result.region;
					responseObject.summoners = result.summoners;
					_handleResponse(res, 200, responseObject);
				} else {
					_handleResponse(res, 404, responseObject);
				}
			}
		});
	});

	router.post('/generateShortUrl', function(req, res) {
		var body = req.body;
		console.log(shortenedUrlDocument);
		var shortenedUrlDocument = new _shortenedUrlModel();
		shortenedUrlDocument.summoners = body.summoners;
		shortenedUrlDocument.region = body.region;

		console.log(shortenedUrlDocument);

		shortenedUrlDocument.save(function(error, result) {
			if (error) _handleResponse(res, 500);
			else {
				_handleResponse(res, 200, shortenedUrlDocument._id);
			}
		});
	});

	self.init = function(router) {
		_shortenedUrlModel = require('../../persistence/mongoModels/shortenedUrlsModel');
	}
}