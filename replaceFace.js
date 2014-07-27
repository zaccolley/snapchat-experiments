var cv = require('opencv'),
	fs = require('fs'),
	gm = require('gm'),

	baseImg = "images/mona.png",
	overlayImg = "images/cat.png",
	outputImg = "images/output.jpg";

cv.readImage(baseImg, function(err, im){

	if(err) return console.log("Error: " + err); // return any errors

	im.detectObject("./haarcascade_frontalface_alt.xml", {}, function(err, images){

		if(err) return console.log("Error: " + err); // return any errors

		var face = getBiggestImage(images);
		compositeImages(baseImg, overlayImg, outputImg, face, function(err){
			if(err) return console.dir(arguments); // return any errors
			console.log("gm command: ", arguments[3]); // display the command generated
		});

	});

});

// composite image over another
function compositeImages(baseImg, overlayImg, outputImg, overlayImgData, callback){

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