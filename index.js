$(document).ready(function() {

var width = 1;
$(function() {
    $( "#slider" ).slider({
      value: width,
      min:1,
      max:50,
      orientation: "horizontal",
      range: "min",
      animate: true,
      slide: function( event, ui ) {
        width = $( "#slider" ).slider( "value" );
		console.log("w"+width);
      }
    });
  });



var strokeColor = "black";
$('.colorbox').on('click', function() {
	strokeColor = $(this).data("bcolor");
});


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
	
	width = $( "#slider" ).slider( "option", "value" );
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
    ctx.beginPath();
    ctx.strokeStyle=strokeColor;

    if (e.which == 1) {
/*         console.log('x: ' + e.pageX + ' y: '+ e.pageY); */
        xEnd = x;
		yEnd = y;
		ctx.moveTo(xStart,yStart);
		ctx.lineTo(xEnd,yEnd);
		xStart = xEnd;
		yStart = yEnd;
    };
	ctx.stroke();
	ctx.save();

});


$('#undo').on('click', function() {
	     ctx.restore();
});



$(c).on("mouseup", function(){
	startNewLine = true;
});

$(c).on("mousedown", function(){
	startNewLine = false;
});

$(document).on('click', '#saveImage', function(c) {
/* var c = document.getElementById("sketch"); */
var dataString = c.toDataURL();
      document.getElementById('canvasImg').src = dataString;

/* window.open(dataString); */
});


function to_image(){
    document.getElementById("theimage").src = c.toDataURL();
}

function download_image(){
    //Canvas2Image.saveAsPNG(canvas);
    var image = c.toDataURL("image/png").replace("image/png", "image/octet-stream"); // here is the most important part because if you dont replace you will get a DOM 18 exception.
/*     window.location.href=image; */
    
    
    $data = base64_decode(image);

list($type, $data) = explode(';', $data);
list("", $data)      = explode(',', $data);
$data = base64_decode($data);

/* file_put_contents('image.png', $data); */

var image = new Image();
image.src = $data;
document.body.appendChild(image);


}




/*
function save_image_local(){
	var image = c.toDataURL("image/png").replace("image/png", "image/octet-stream");
	$.ajax()
	
}
*/


document.getElementById('bt_draw').onclick = to_image
document.getElementById('bt_download').onclick = download_image
/* document.getElementById('bt_saveLocal').onclick = save_image_local */


});
