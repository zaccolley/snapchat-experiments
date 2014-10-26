var snapchat = require('snapchat'),
	client = new snapchat.Client(),
	config = require('./snapchat-config.json'),

	replaceFace = require('./replaceFace.js'),
	sendSnap = require('./sendSnap.js'),

	fs = require('fs');

var imgDir = "./images/snaps/";

// Make sure the images folder exists
if(!fs.existsSync(imgDir)) {
	fs.mkdirSync(imgDir);
}

console.log("Logging in as '" + config.username + "'...");
client.login(config.username, config.password).then(function(data){
	
	console.log("Logged in.");

	// if they're aren't any snaps stop everything maaan
	if(typeof data.snaps === 'undefined' || !data.snaps.length){
		console.log("No snaps!");
		return;
	}

	var snaps = cleanSnaps(data.snaps).received;
	
	fs.writeFile("./snapchat-data.json", JSON.stringify(cleanSnaps(data.snaps), null, 2), function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	});

	// loop through the latest received snaps
	snaps.forEach(function(snap){

		// Make sure the snap item is unopened
		if(snap.state == "unopened"){

			// file type should be jpg but could be a video
			var fileType = '.jpg';
			if(snap.type == 'video'){
				fileType = '.mp4'
			};

			var imgPath = imgDir + snap.username + "-" + snap.id + fileType;

			var stream = fs.createWriteStream(imgPath, { flags: 'w', encoding: null, mode: 0666 });

			client.getBlob(snap.id).then(function(blob){
				blob.pipe(stream);
				console.log('Saved snap: "' + imgPath + '" from ' + snap.username + '...');
			});
		
			/*stream.on('finish', function(){
				if(snap.type == 'image'){

					var outputPath = imgDir + snap.username + "-" + snap.id +"_altered" + fileType;
					replaceFace(snap, function(){
						console.log("Processed and sending '" + outputPath + "'");
						sendSnap(7, outputPath, ["zaccolley"], function(data){
							console.log("Sent '" + outputPath + "' to " + snap.username);
						});
					});

				}
			});*/

		}

	});

},
function(err) {
	console.error("Failed to login");
	console.error(err)
});

function cleanSnaps(snaps){

	var newSnaps = { "sent": [], "received": [], "other": [] };

	snaps.forEach(function(snap){

		var newSnap = {};

		// video
		if(typeof snap.m !== "undefined"){
			if(snap.m == 1){
				snap.type = "video";
			}else if(snap.m == 3){
				snap.type = "added";
			}else{
				snap.type = "image";
			}
			delete snap.m;
		}

		// screenshot
		if(typeof snap.c !== "undefined"){
			snap.screenshot = snap.c;
			delete snap.c
		}

		// username
		if(typeof snap.sn !== "undefined"){
			snap.username = snap.sn;
			delete snap.sn;
		}

		// timestamp
		if(typeof snap.ts !== "undefined"){
			snap.timestamp = snap.ts;
			delete snap.ts;
		}

		// sent timestmap
		if(typeof snap.sts !== "undefined"){
			snap.timestamp_sent = snap.sts;
			delete snap.sts;
		}

		// recipient
		if(typeof snap.rp !== "undefined"){
			snap.recipient = snap.rp;
			delete snap.rp;
		}

		// rounded timer
		if(typeof snap.t !== "undefined"){
			delete snap.t;
		}

		// state
		if(typeof snap.st !== "undefined"){

			if(snap.st == 1){
				snap.state = "unopened";
			}
			else if(snap.st == 2){
				snap.state = "opened";
			}
			else{
				snap.state = snap.st;
			};

			delete snap.st;
		}

		if(snap.type == "image" || snap.type == "video"){

			// if there is a recipient then it was sent
			if(typeof snap.recipient !== "undefined"){
				newSnaps.sent.push(snap);
			}else{
				newSnaps.received.push(snap);
			}

		}else{
			delete snap.t;
			delete snap.timer;
			newSnaps.other.push(snap);
		}

	});

	return newSnaps;
}

function getUnique(arr){

	var newArr = [];

	arr.forEach(function(element, index, array){
	  
	  var found = false;
	  var newId = element.sn;
	  
	  newArr.forEach(function(element, index, array){
	    if(element.sn === newId) found = true;
	  });
	  
	  if(!found){
	    newArr.push(element);  
	  }
	    
	});

	return newArr;

}