$(document).ready(function () {

  var canvasStack = document.getElementById('canvasStack');
  var lastPoint = null;
  currentColor = "000";
  mouseDown = 0;
  xy = "";
  brushStyle = "solid";
  brushWidth = 10;
  zindex = 1;
  currentLine = 1;
  visibleLine = 1;

//UNUSED?
  var canvasArray = [];
  event.preventDefault();


  //REFERENCE FIREBASE
  var pixelDataRef = new Firebase('https://draw-with-me.firebaseio.com/');

  //SETUP THE CANVAS
  var initialize = function(){
    myCanvas = document.getElementById('drawing-canvas');
    myContext = myCanvas.getContext ? myCanvas.getContext('2d') : null;
    if (myContext == null) {
      alert("You must use a browser that supports HTML5 Canvas to run this demo.");
      return;
    }

    //SETUP COLOR PALETTE
    var colors = ["fff","000","f00","0f0","00f","88f","f8d","f88","f05","f80","0f8","cf0","08f","408","ff8","8ff"];
    for (c in colors) {
      var item = $('<div/>').css("background-color", '#' + colors[c]).addClass("colorbox");
      item.click((function () {
        var col = colors[c];
        return function () {
          currentColor = col;
        };
      })());
      item.appendTo('#colorholder');
    }
  };

  //Keep track of if the mouse is up or down
  $(document).on('mousedown', '#drawing-canvas', function(){
      mouseDown = 1;
  });


  $(document).on('mouseup', '#drawing-canvas', function() {
      // console.log($(this));

      // Change current canvas id to layerzindex
      layerid = "layer" + (currentLine - 1);
      $('#drawing-canvas').attr('id', layerid);
      canvas = document.createElement('canvas');
      canvasStack.appendChild(canvas);
      $('#l-demo-container').find('canvas').last().attr('id', "drawing-canvas");
      $('#l-demo-container').find('canvas').last().css('z-index', currentLine);
      canvas.width = 1080;
      canvas.height = 620;
      zindex += 1;

      mouseDown = 0; lastPoint = null;
      pixelDataRef.child('priorityCounter').set(priorityCounter);
      visibleLine++;
      console.log(visibleLine);
      pixelDataRef.child('lineVisible').set(visibleLine);
      currentLine++;
      console.log(currentLine);
      pixelDataRef.child('currentLine').set(currentLine);
      // myCanvas = document.getElementById('drawing-canvas');
    // };
    });

//SET DEFAULT OR PULL FROM DATABASE(ON LOAD/RELOAD)
   pixelDataRef.child('priorityCounter').once('value', function(snapshot) {
     if (snapshot.val() === null) {
        priorityCounter = 1;
        pixelDataRef.child('priorityCounter').set(priorityCounter);
     } else {
        priorityCounter = snapshot.val();
     }
   });

   pixelDataRef.child('currentLine').once('value', function(snapshot) {
     if (snapshot.val() === null) {
        currentLine = 1;
        pixelDataRef.child('currentLine').set(currentLine);
     } else {
        currentLine = snapshot.val();
     }
   });
   pixelDataRef.child('visibleLine').once('value', function(snapshot) {
     if (snapshot.val() === null) {
        visibleLine = 1;
        pixelDataRef.child('visibleLine').set(visibleLine);
     } else {
        visibleLine = snapshot.val();
     }
   });


// GET BRUSHWIDTH
function getWidthSlider() {
  var result = document.getElementById('brushWidth');
  console.log('result' + result.value);
  return result;
};


    //Draw a line from the mouse's last position to its current position
    var drawLineOnMouseMove = function(e) {

      if (!mouseDown) return;
      console.log("md "+ mouseDown);
      // e.preventDefault();
      // Bresenham's line algorithm. We use this to ensure smooth lines are drawn
      var offset = $('canvas').offset();
      var x1 = Math.floor((e.pageX - offset.left)),
        y1 = Math.floor((e.pageY - offset.top));
      var x0 = (lastPoint == null) ? x1 : lastPoint[0];
      var y0 = (lastPoint == null) ? y1 : lastPoint[1];
      var dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      var sx = (x0 < x1) ? 1 : -1, sy = (y0 < y1) ? 1 : -1, err = dx - dy;
      while (true) {
        //write the pixel into Fi=currebase, or if we are drawing white, remove the pixel
        xy = x0 + ":" + y0 + ":" + cur_line_num;
        xy = xy.toString();
        brushWidth = getWidthSlider();
        console.log("bw"+brushWidth);
        var info_dict = {currentColor:currentColor, brushWidth:brushWidth, brushStyle:brushStyle, display: "initial"};
/*
        console.log("a"+ currentColor);
        console.log("a"+ pixSize);
        console.log("a"+ brushStyle);
*/

    pixelDataRef.child(xy).setWithPriority(info_dict, priorityCounter);
    priorityCounter++;

        if (x0 == x1 && y0 == y1) break;
        var e2 = 2 * err;
        if (e2 > -dy) {
          err = err - dy;
          x0 = x0 + sx;
        }
        if (e2 < dx) {
          err = err + dx;
          y0 = y0 + sy;
        }
      }
      lastPoint = [x1, y1];
    };
    $(document).on('mousemove', '#drawing-canvas', function(e){
      drawLineOnMouseMove(e);
    });
    $(document).on('mousedown', '#drawing-canvas', function(e){
      drawLineOnMouseMove(e);
    });

    // $('#drawing-canvas').mousemove(drawLineOnMouseMove);
    // $('#drawing-canvas').mousedown(drawLineOnMouseMove);


    // Add callbacks that are fired any time the pixel data changes and adjusts the canvas appropriately.
    // Note that child_added events will be fired for initial pixel data as well.
last_line_number = -1;

    var drawPixel = function(snapshot) {
      var coords = snapshot.name().split(":");

      if (!isNaN(coords[0])) {


        line_number = parseInt(coords[2]);
              console.log('last '+last_line_number);
              console.log('cur '+line_number);
        if (line_number > last_line_number) {
          layerid = "layer" + (line_number - 1);
          $('#drawing-canvas').attr('id', layerid);
          canvas = document.createElement('canvas');
          canvasStack.appendChild(canvas);
          var el = $('#l-demo-container').find('canvas').last();
          el.attr('id', "drawing-canvas");
          el.css('z-index', line_number);
          canvas.width = 1080;
          canvas.height = 620;
          zindex += 1;

          if (snapshot.val().display === "hidden") {
            el.addClass('hidden');
          } else {
            el.removeClass('hidden');
          };
        }

        myContext = myCanvas.getContext ? myCanvas.getContext('2d') : null;

        myContext.fillStyle = "#" + snapshot.val().currentColor;
        pixSize = snapshot.val().pixSize;
        brushStyle = snapshot.val().brushStyle;
        x00 = parseInt(coords[0]);
        y00 = parseInt(coords[1]);
        myContext.fillRect(x00, y00, pixSize, pixSize);

        /*       pixelDataRef.child(cur_line_num).set({color:currentColor, pixSize:pixSize, brushStyle:brushStyle}); */
        // lineVisible++;
        // console.log(lineVisible);
        // pixelDataRef.child('lineVisible').set(lineVisible);
        // cur_line_num++;
        // console.log(cur_line_num);
        // pixelDataRef.child('cur_line_num').set(cur_line_num);
        myCanvas = document.getElementById('drawing-canvas');
      }
        last_line_number = line_number;
    };


    $('#undo').on('click', function() {
      // if (lineVisible >= cur_line_num) {
      //   return;
      // }

    //line_number = style:display:none
    //line_number--  = or into array?
      // var layerHide = 'layer' + (lineVisible-2)
      hideElement = document.getElementById(('layer' + (lineVisible-2)));
      $(hideElement).addClass('hidden');
      lineVisible--;
      console.log(lineVisible+"-");
      pixelDataRef.child('lineVisible').set(lineVisible);
    });

    $('#redo').on('click', function() {
      // if (lineVisible >= cur_line_num) {
      //   return;
      // }
      showElement = document.getElementById(('layer' + (lineVisible-1)));
      $(showElement).removeClass('hidden');

      lineVisible++;
      console.log(lineVisible+"+");
      pixelDataRef.child('lineVisible').set(lineVisible);
    });

    var clearPixel = function(snapshot) {
      console.log("shouldn't be here");
      var coords = snapshot.name().split(":");
      if (isNaN(snapshot.val()[1])) {
        pixSize = 1;
      } else {
        pixSize = snapshot.val()[1];
      }
      if (pixSize > 1) {
      for (var i = 0; i < pixSize; i++) {
        for (var j = 0; j < pixSize; j++) {
            x0 += i;
            y0 += j;
        myContext.fillRect(parseInt(coords[0]), parseInt(coords[1]), 1, 1);
          }
      }
  }
      myContext.clearRect(parseInt(coords[0]), parseInt(coords[1]), pixSize, pixSize);
    };

    pixelDataRef.on('child_added', drawPixel);
    pixelDataRef.on('child_changed', drawPixel);
    pixelDataRef.on('child_removed', clearPixel);


  initialize();


// function drawBrushSize() {
//       $( "#slider" ).slider({
//       value: pixSize,
//       min:1,
//       max:50,
//       orientation: "horizontal",
//       range: "min",
//       animate: true,
//         slide: function( event, ui ) {
//             pixSize = $( "#slider" ).slider( "value" );
//             $('#brushWidth').val(pixSize);
//         }
//     });
// };


});
