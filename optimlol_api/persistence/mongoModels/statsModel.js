var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatsSchema = new Schema({
	summonerId: { type: String, required: true },
	region: { type: String, required: true },
	data: Schema.Types.Mixed,
	created_at: { type: Date },
	updated_at: { type: Date }
});

StatsSchema.pre('save', function(next) {
	var now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

module.exports = mongoose.model('stats', StatsSchema);