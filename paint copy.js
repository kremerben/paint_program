$(document).ready(function() {

var pixSize = 1;

var width = 1;
//BUILD BRUSH WIDTH SLIDER
$(function() {
    $( "#slider" ).slider({
        value: width,
        min:1,
        max:100,
        orientation: "horizontal",
        range: "min",
        animate: true,
        slide: function( event, ui ) {
            width = $( "#slider" ).slider( "value" );
//            console.log("w"+width);
            $('#brushWidth').val(width);
        }
    });
});

//SET BRUSH COLOR
var strokeColor = "black";
$('.colorbox').on('click', function() {
    strokeColor = $(this).data("bcolor");
});

//FIND CURSOR POSITION
function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function getWidthSlider() {
	width = $( "#slider" ).slider( "option", "value");
	return width;
}

var c=document.getElementById("DrawCanvas");
var ctx=c.getContext("2d");
ctx.lineWidth=3;

var xCur;
var yCur;
var xStart;
var yStart;
var startNewLine = true;
    
    //Create a reference to the pixel data for our drawing.
    var pixelDataRef = new Firebase('https://draw-with-me.firebaseio.com/');
    
    
//START DRAWING
$("#DrawCanvas").on("mousemove", function(e) {
	ctx.lineWidth=getWidthSlider();
	ctx.lineCap="round";

    var pos = findPos(this);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;

	if (startNewLine) {
        xStart = x;
		yStart = y;
	}
/*
    ctx.beginPath();
    ctx.strokeStyle=strokeColor;
*/

    //write the pixel into Firebase, or if we are drawing white, remove the pixel
    pixelDataRef.child(x + ":" + y).set(strokeColor = strokeColor);

    if (e.which == 1) {
        xEnd = x;
		yEnd = y;
/*
		ctx.moveTo(xStart,yStart);
		ctx.lineTo(xEnd,yEnd);
*/
		xStart = xEnd;
		yStart = yEnd;
    }
/*
	ctx.stroke();
	ctx.save();
*/
});

    // Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
    // Note that child_added events will be fired for initial pixel data as well.
    var drawPixel = function(snapshot) {
      var coords = snapshot.name().split(":");
      ctx.fillStyle = "#" + snapshot.val();
      ctx.fillRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
    };
    var clearPixel = function(snapshot) {
      var coords = snapshot.name().split(":");
      ctx.clearRect(parseInt(coords[0]) * pixSize, parseInt(coords[1]) * pixSize, pixSize, pixSize);
    };
    pixelDataRef.on('child_added', drawPixel);
    pixelDataRef.on('child_changed', drawPixel);
    pixelDataRef.on('child_removed', clearPixel);


$('#undo').on('click', function() {
	     ctx.restore();
});

$(c).on("mouseup", function(){
	startNewLine = true;
});

$(c).on("mousedown", function(){
	startNewLine = false;
});



//$(document).on('click', '#saveImage', function(c) {
///* var c = document.getElementById("sketch"); */
//    var dataString = c.toDataURL();
//    document.getElementById('canvasImg').src = dataString;
//    /* window.open(dataString); */
//});


$("#bt_draw").on('click', function() {
    document.getElementById("theimage").src = c.toDataURL();
});

//DOWNLOAD IMAGE TO COMPUTER
function downloadCanvas(link, canvasId, filename) {
    link.href = document.getElementById(canvasId).toDataURL();
    link.download = filename;
}

document.getElementById('bt_download').addEventListener('click', function() {
    downloadCanvas(this, 'DrawCanvas', 'draw_with_me.png');
}, false);


//SAVE IMAGE TO SERVER
$("#bt_saveLocal").on('click', function() {
	var image = c.toDataURL("image/png").replace("image/png", "image/octet-stream");
    // save canvas image as data url (default is png)
    var dataURL = c.toDataURL();
    // set canvasImg image src to dataURL
    // so it can be saved as an image
    document.getElementById('canvasImg').src = dataURL;

    var title = "Draw With Me";

    url = 'save_image/';

    $.ajax({
        type: "POST",
        url: url,
        dataType: 'text',
        data: {
            base64data : dataURL,
            title: title
        }
    });

});


$('#clearCanvas').on('click', function() {
    ctx.clearRect(0, 0, c.width, c.height);
});



});
