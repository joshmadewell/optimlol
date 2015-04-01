var shortId = require('shortid');

module.exports = function(router) {
	var self = this;

	var _shortenedUrlModel = null;
	var _statusMessagesModel = null;

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
		this.shortUrl = null;
	}

	var MessagesResponseObject = function() {
		this.messages = [];
	}

	router.get('/getUrlData/:urlId', function(req, res) {
		var urlId = req.params.urlId;
		var responseObject = new UrlDataResponseObject();
		_shortenedUrlModel.findOne({_id: urlId}, function(error, result) {
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

	router.get('/generateShortUrl', function(req, res) {
		var query = req.query;

		var responseObject = new UrlDataResponseObject();

		var shortenedUrlDocument = new _shortenedUrlModel();
		shortenedUrlDocument._id = shortId.generate();
		shortenedUrlDocument.summoners = query.summoners.split(',');
		shortenedUrlDocument.region = query.region || 'na';

		shortenedUrlDocument.save(function(error, result) {
			if (error) _handleResponse(res, 500);
			else {
				responseObject.shortUrl = shortenedUrlDocument._id;
				responseObject.summoners = shortenedUrlDocument.summoners;
				responseObject.region = shortenedUrlDocument.region;
				_handleResponse(res, 200, responseObject);
			}
		});
	});

	router.get('/statusMessages', function(req, res) {
		var responseObject = new MessagesResponseObject();
		_statusMessagesModel.find({}, function(error, result) {
			if (error) _handleResponse(res, 500);
			else {
				responseObject.messages = result;
				_handleResponse(res, 200, responseObject);
			}
		});
	});

	self.init = function(router) {
		_shortenedUrlModel = require('../../persistence/mongoModels/shortenedUrlsModel');
		_statusMessagesModel = require('../../persistence/mongoModels/statusMessagesModel');
	}
}