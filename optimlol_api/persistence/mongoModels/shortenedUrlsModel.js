var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ShortenedUrlSchema = new Schema({
	_id: { type: String, required: true },
	region: { type: String, required: true },
	summoners: { type: Array },
	created_at: { type: Date },
	updated_at: { type: Date }
});

ShortenedUrlSchema.pre('save', function(next) {
	var now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

// mongoose makes collections plural if we don't specify an name in third parameter :[
// this one is already plural but I like consistency.
module.exports = mongoose.model('shortenedUrls', ShortenedUrlSchema, 'shortenedUrls');