var snapchat = require('snapchat'),
	client = new snapchat.Client(),
	config = require('./snapchat-config.json'),

	replaceFace = require('./replaceFace.js'),
	sendSnap = require('./sendSnap.js'),

	fs = require('fs');

// Make sure the images folder exists
if(!fs.existsSync('./images')) {
	fs.mkdirSync('./images');
}

client.login(config.username, config.password).then(function(){
	client.getFriendStories().then(function(data){
		console.log(data);
	});
},
function(err) {
	console.error("Failed to login");
	console.error(err)
});