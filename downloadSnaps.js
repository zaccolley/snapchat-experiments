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

client.login(config.username, config.password).then(function(data){
	// Handle any problems, such as wrong password
	if(typeof data.snaps === 'undefined'){
		console.log(data);
		return;
	}

	if(!data.snaps.length) return console.log("No snaps!");

	var newSnaps = [];

	data.snaps.forEach(function(element, index, array){
	  
	  var found = false;
	  var newId = element.sn;
	  
	  newSnaps.forEach(function(element, index, array){
	    if(element.sn === newId) found = true;
	  });
	  
	  if(!found){
	    newSnaps.push(element);  
	  }
	    
	});

	// Loop through the latest snaps
	newSnaps.forEach(function(snap) {
		// Make sure the snap item is unopened and sent to you (not sent by you)
		if (typeof snap.sn !== 'undefined' && typeof snap.t !== 'undefined'
				&& snap.st == 1 && typeof snap.timer !== 'undefined' && typeof snap.zipped == 'undefined'
				&& typeof snap.rp == 'undefined'){
			console.log('Saving snap from ' + snap.sn + '...');

			// Save the image to ./images/{SENDER USERNAME}_{SNAP ID}.jpg
			// var imgPath = './images/' + snap.sn + '_' + snap.id + '.jpg';
			var imgPath = './images/' + snap.sn + '.jpg';
			var stream = fs.createWriteStream(imgPath, { flags: 'w', encoding: null, mode: 0666 });

			client.getBlob(snap.id).then(function(blob){
				blob.pipe(stream);
			});
		
			stream.on('finish', function(){
				var outputPath = './images/' + snap.sn +"_cat.jpg";
				replaceFace(snap.sn, function(){
					sendSnap(5, outputPath, [snap.sn]);
				});
			});

		}
	});
},
function(err) {
	console.error("Failed to login");
	console.error(err)
});