var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StatusMessageSchema = new Schema({
	message: { type: String, required: true },
	level: { type: String, required: false, default: 'info' },
	dismissable: {type: Boolean, required: true, default: true }
});

StatusMessageSchema.pre('save', function(next) {
	var now = new Date();
	this.updated_at = now;
	if (!this.created_at) {
		this.created_at = now;
	}
	next();
});

// mongoose makes collections plural if we don't specify an name in third parameter :[
// this one is already plural but I like consistency.
module.exports = mongoose.model('statusMessages', StatusMessageSchema, 'statusMessages');