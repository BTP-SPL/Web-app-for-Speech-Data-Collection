const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
	text: {
		type: String,
		required: false
	},
	index: {
		type: String,
		required: false
	},
	filename:{
		type: String,
		required: false
	},
	text_url: {
		type: String,
		required: false
	},
	audio_url: {
		type: String,
		required: false
	},
});

module.exports = User = mongoose.model("Users", UserSchema);
