var cv = require('opencv'),
	fs = require('fs'),
	exec = require('child_process').exec,

	bgImg = "images/pete.jpg",
	overlayImg = "images/cat.png",
	outputImg = "images/test.png";

cv.readImage(bgImg, function(err, im){

	if(err){
		console.log("Error: " + err);
	}else{

		im.detectObject("./haarcascade_frontalface_alt.xml", {}, function(err, faces){  

			var biggestFace = faces[0];

			for (var i = 1; i < faces.length; i++){
				var face = faces[i];

				// compare to see if face is bigger or not
				if( (face.width > biggestFace.width) && (face.height > biggestFace.height) ){
					biggestFace = face;
				}

			}

			var face = biggestFace;
			
			exec("gm composite -geometry +"+face.x+"+"+face.y+" -resize "+face.width+"x"+face.height+" "+overlayImg+" "+bgImg+" /output/"+outputImg);

		});

	}

});