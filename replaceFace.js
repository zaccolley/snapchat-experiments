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

			var count = 0;
			compositeImages(baseImg, overlayImg, outputImg, images, count, function(){
				gm(outputImg).size(function(err, image){

					gm(outputImg)
						.fill('#00000066')
	  					.drawRectangle(0, 0, image.width, 70)
						.fontSize(30)
						.fill('#f5f5f5')
						.drawText(0, 50, 'Hi, '+user, 'North')
						.minify()
						.write(outputImg, function(err){
							if(err) return console.dir(arguments);

							callback();
						});

				});
			});

		});

	});
}

// composite image over another
function compositeImages(baseImg, overlayImg, outputImg, faces, count, finishedCompositingCallback){
	// if end of faces
	if(count == faces.length){
		finishedCompositingCallback();
	}else{

		var face = faces[count];
		console.log("face data: ", face);

		count++; // up the count for the next use

		gm().subCommand('composite')
			.out('-geometry', '+'+face.x+'+'+face.y) // position of overlayed image
			.out('-resize', face.width+'x'+face.height) // resize the overlayed image
			.out(overlayImg, baseImg)
			.write(outputImg, function(){
					compositeImages(outputImg, overlayImg, outputImg, faces, count, function(err){
						if(err) console.log(err); return; // return any errors

						finishedCompositingCallback();
					})
				}
			);

	}

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