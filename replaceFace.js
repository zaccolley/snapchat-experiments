var cv = require('opencv'),
	gm = require('gm'),
	fs = require('fs');

module.exports = replaceFace;

function replaceFace(user, callback){
	var baseImg = "./images/"+user+".jpg",
		overlayImg = "./images/cat.png",
		outputImg = "./images/"+user+"_cat.jpg";

	cv.readImage(baseImg, function(err, im){

		if(err){
			console.log("Error: " + err); // return any errors
			return;
		}

		im.detectObject("./haarcascade_frontalface_alt.xml", {}, function(err, images){

			console.log(images);
			if(err){
				console.log("Error: " + err);
				return; // return any errors
			}
			if(!images){
				console.log('No faces');
				return;
			 } 

			var face = getBiggestImage(images);
			console.log(user+"'s face data: ", face);
			compositeImages(baseImg, overlayImg, outputImg, face, function(err){
				if(err) return console.dir(arguments); // return any errors
				console.log("gm command: ", arguments[3]); // display the command generated
				callback();
			});

		});

	});
}

// composite image over another
function compositeImages(baseImg, overlayImg, outputImg, overlayImgData, callback){
	console.log(overlayImgData);
	gm().subCommand('composite')
		.out('-geometry', '+'+overlayImgData.x+'+'+overlayImgData.y) // position of overlayed image
		.out('-resize', overlayImgData.width+'x'+overlayImgData.height) // resize the overlayed image
		.out(overlayImg, baseImg)
		.write(outputImg, callback);

}

// find the biggest image
function getBiggestImage(imgs){
	var biggestImg = imgs[0];

	for (var i = 1; i < imgs.length; i++){
		var img = imgs[i];

		// compare to see if Image is bigger or not
		if( (img.width > biggestImg.width) && (img.height > biggestImg.height) ){
			biggestImg = img;
		}

	}

	return biggestImg;
}