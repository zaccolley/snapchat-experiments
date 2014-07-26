var snapchat = require('snapchat'),
    client = new snapchat.Client(),
    fs = require('fs'),
    cv = require('opencv'),
    assert = require('assert')
    fs =require('fs'),
    exec = require('child_process').exec;

// Make sure the images folder exists
if(!fs.existsSync('./images')) {
    fs.mkdirSync('./images');
}

client.login('hacksotontest1', 'snaptest1').then(function(data) {
    // Handle any problems, such as wrong password
    if (typeof data.snaps === 'undefined') {
        console.log(data);
        return;
    }

    // console.log(data);

    // Loop through the latest snaps
    data.snaps.forEach(function(snap) {
        // Make sure the snap item is unopened and sent to you (not sent by you)
        if (typeof snap.sn !== 'undefined' && typeof snap.t !== 'undefined' && snap.st == 1) {
            console.log('Saving snap from ' + snap.sn + '...');

            // Save the image to ./images/{SENDER USERNAME}_{SNAP ID}.jpg
            var imgPath = './images/' + snap.sn + '_' + snap.id + '.jpg';
            var stream = fs.createWriteStream(imgPath, { flags: 'w', encoding: null, mode: 0666 });

            client.getBlob(snap.id).then(function(blob) {
                console.log(blob);
                blob.pipe(stream);
                blob.resume();
            });

            stream.on('finish', function() {
                console.log("end of stream");
                console.log(cv.version);

                var imgPath = stream.path.substring(2);
                console.log(imgPath);
                if(imgPath == "images/zaccolley_648811406383816326r.jpg"){

                    cv.readImage(imgPath, function(err, im){

                        im.detectObject("./haarcascade_frontalface_alt.xml", {}, function(err, faces){  

                            var biggestFace = { x: 0, y: 0, width: 0, height: 0 };

                            for (var i=0;i<faces.length; i++){
                                var face = faces[i];
                                console.log(face);

                                if( (face.width > biggestFace.width) && (face.height > biggestFace.height) ){
                                    biggestFace = face;
                                }

                            }

                            var face = biggestFace;
                            
                            var command = "gm composite -geometry +"+face.x+"+"+face.y+" -resize "+face.width+"x"+face.height+" ./images/cat.png "+imgPath+" "+imgPath+".png";
                            console.log(command);
                            exec(command);

                        });
                    });

                }
                console.error('all writes are now complete.');
            });

        }
    });
},
function(err) {
    console.error("Failed to login");
    console.error(err)
});