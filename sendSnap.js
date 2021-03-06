var snapchat = require('snapchat'),
	client = new snapchat.Client(),
	config = require('./snapchat-config.json'),

	Q = require('q'),
	fs = require('fs');

module.exports = sendSnaps;

function sendSnaps(time, filename, recipients, callback){
	client.login(config.username, config.password).then(function(){
		var blob = fs.createReadStream(filename);
		return client.upload(blob, false);
	}, function(err) {
		console.error("Failed to login");
		console.error(err);
	})
	.then(function(mediaId){
		return Q.allSettled(recipients.map(function(recipient){
			return client.send(mediaId, recipient, time).catch(function(err) {
				console.error("Failed to send snap to", recipient);
				console.error(err);
			});
		}));
	}, function(error){
		console.error("Unable to upload file", filename);
		console.error(error);
	})
	.then(function(statuses){
		callback(statuses);
	}, function(err) {
		console.error("There was an error")
		console.error(err);
	});

}