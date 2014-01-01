/**
 * Functions to create and manipulate our HTML5 <canvas>
 * (that we use for finger writing practice)
 * 
 * @package    JapxlateAndroid (https://github.com/drappenheimer/japxlate-android)
 * @author     Daniel Rhodes
 * @copyright  Copyright (c) 2013-2014 Warp Asylum Ltd (UK) [trading as "Dr Appenheimer"].
 * @license    see LICENCE file in source code root folder     Apache v2.0
 */

/**
 * The drawing context of our <canvas>
 */
var global_canvasElement;

/**
 * Our <canvas> DOM element
 */
var global_canvas;

/**
 * Are we already drawing on the canvas?
 */
var global_startedDrawing = false;

/**
 * Save our global canvas variables
 * and add the event listeners and
 * and set the default line drawing style
 * should only be run once (but see docblock for adjustCanvas())
 * 
 * @author Daniel Rhodes
 */
function initialiseCanvas()
{
    //set the globals
    global_canvasElement = document.getElementById('paper');
    global_canvas = global_canvasElement.getContext('2d');
    
    //simulated touch (ie. mouse) dragging for writing pad
    global_canvasElement.addEventListener('mousedown', mousedownForCanvas, false);
    global_canvasElement.addEventListener('mousemove', mousemoveForCanvas, false);
    global_canvasElement.addEventListener('mouseup', mouseupForCanvas, false);
    
    //touch dragging for writing pad
    global_canvasElement.addEventListener('touchstart', touchstartForCanvas, false);
    global_canvasElement.addEventListener('touchmove', touchmoveForCanvas, false);
    global_canvasElement.addEventListener('touchend', touchendForCanvas, false);
    
    //line drawing style
    global_canvas.strokeStyle = '#990000'; //our trademark red
    global_canvas.lineWidth = 10;
    global_canvas.lineCap = 'round';   //dat calligraphy feel
    global_canvas.lineJoin = 'round';   //dat calligraphy feel
}

/**
 * device "rotation" handler
 * 
 * @author Daniel Rhodes
 */
function configureCanvasRotationAdjustment()
{
    window.addEventListener('resize', adjustCanvas, false);
}

/**
 * "New character" and "Clear" buttons
 * 
 * @author Daniel Rhodes
 */
function configureCanvasButtons()
{
    document.getElementById('canvas-clear').addEventListener('click', clearCanvas, false);
    document.getElementById('canvas-new').addEventListener('click', doNewChar, false);
}

/**
 * adjust - creating if necessary - the canvas element
 * @note resizing canvas has the odd side effect of clearing the canvas content AND
 * @note resetting any altered settings (lineWidth etc) to default.
 * @note so we actually need to call initialiseCanvas() every time
 * 
 * @author Daniel Rhodes
 */
function adjustCanvas()
{
    var container = document.getElementById('write-canvas-container');
    
    var style = window.getComputedStyle(container);
    
    var width = parseInt(style.width);
    var height = parseInt(style.height);
    
    var smallestDim = width;    //smallest dimension is width (= portrait)
    
    if(height < width)  //ie. landscape
    {
        smallestDim = height;
    }
    
    //invisible frame around canvas so it's not flush with buttons etc
    var frameGap = 15;
    smallestDim -= (frameGap * 2);  //gap at top and bottom (left and right)
    
    var canvas = null;  //we proceed to get or create this
    
    //element existence check
    var firstTime = !document.getElementById('paper');
    
    if(firstTime)   //create canvas element with correct id
    {
        canvas = document.createElement('canvas');
        canvas.id = 'paper';
        //canvas.style.position = 'relative'; //so we can "top" the canvas down
    }
    
    else    //get existing canvas element
    {
        canvas = document.getElementById('paper');
    }
    
    //if(global_canvas)
    //console.log('before resize: ' + global_canvas.lineWidth);
    
    //size and position the canvas
    //(NOTE resizing has the odd side effect of clearing the canvas content AND
    //resetting any altered setting (lineWidth etc) to default)
    //so we actually need to call initialiseCanvas() every time
    canvas.width = smallestDim;
    canvas.height = smallestDim;
    canvas.style.top = frameGap + 'px';
    
    //if(global_canvas)
    //console.log('after resize: ' + global_canvas.lineWidth);
    
    //add canvas (as child of container) if first time
    if(firstTime)
    {
        //console.log('first time');
        container.appendChild(canvas);
        //initialiseCanvas();    //set globals and events
    }
    //else{console.log('not first time');}
    
    initialiseCanvas();
}

/**
 * Get and display (with explanation) a random Japanese character
 * to practice writing
 * 
 * @author Daniel Rhodes
 */
function doNewChar()
{
    var randomKana = getRandomKana();
    
    document.getElementById('char-to-write').innerHTML = randomKana.char;
    
    document.getElementById('char-explanation').innerHTML = '("' + randomKana.romaji + '" in ' + randomKana.type + ')';
    
    //put character on canvas and fade to nothing (starting at 1 opacity)
    //our trademark #990000 red is rgb(153, 0, 0)
    fadeCharOnCanvas(randomKana.char, 153, 0, 0, 1, 1, 100, 10);
}

/**
 * Animate a fade out of a single (Japanese) character on the canvas. Starting
 * from opacity of startAlpha and stepping down to zero opacity
 * 
 * @author Daniel Rhodes
 * @note this function calls itself until zero opacity is reached
 * @link http://stackoverflow.com/questions/588004/is-javascripts-floating-point-math-broken
 * 
 * @param string char the single character to display
 * @param int startR red element (0 - 255) of character's display colour
 * @param int startG green element (0 - 255) of character's display colour
 * @param int startB blue element (0 - 255) of character's display colour
 * @param float startAlpha first opacity (0.0 - 1.0) to display
 * @param float thisAlpha this step's opacity (0.0 - 1.0) to display
 * @param int msDelay delay, in milliseconds, between frames
 * @param int frameCount how many frames to take to get down to zero opacity?
 */
function fadeCharOnCanvas(char, startR, startG, startB, startAlpha, thisAlpha, msDelay, frameCount)
{
    //calc the step down amount
    var dec = startAlpha / frameCount;
    
    //what will the *next* opacity be?
    var nextAlpha = thisAlpha - dec;
    
    //console.log('thisAlpha:' + thisAlpha + ' -- nextAlpha:' + nextAlpha);
    
    //dues to floating point rounding we prob won't reach exactly zero
    //BUT we want exactly zero for the char to disappear
    //SO if thisAlpha is on the last frame, force to zero
    if(thisAlpha <= (startAlpha - ((frameCount - 1) * dec)))
    {
        //console.log('last frame reached');
        thisAlpha = 0;
    }
    
    clearCanvas();  //else we are drawing a lighter char over a darker one!
    
    //global_canvas.font = 'normal 250px serif';//when 300 box
    //console.log(global_canvasElement.width);
    var fontSize = parseInt(global_canvasElement.width * 0.833);
    //console.log(fontSize);
    global_canvas.font = 'normal ' + fontSize + 'px serif';
    global_canvas.fillStyle = 'rgba(' + startR + ',' + startG + ',' + startB + ',' + thisAlpha + ')';    //rgb alpha
    //global_canvas.fillText(char, 15, 235);//when 300 box
    global_canvas.fillText(char, parseInt(global_canvasElement.width * 0.05), parseInt(global_canvasElement.width * 0.78));
    
    if(nextAlpha < 0)
    {
        //console.log('last frame drawn - exiting');
        return;
    }
    
    setTimeout(function(){fadeCharOnCanvas(char, startR, startG, startB, startAlpha, nextAlpha, msDelay, frameCount)}, msDelay);
}

/**
 * Clear the canvas
 * 
 * @author Daniel Rhodes
 */
function clearCanvas()
{
    //console.log('clear canvas');
    global_canvas.clearRect(0, 0, global_canvasElement.width, global_canvasElement.height);
}

/**
 * Mousedown event handler for canvas - set "now drawing" state
 *  
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function mousedownForCanvas(event)
{
    global_mouseButtonDown = true;
    event.preventDefault(); //need? (maybe not on desktop)
}

/**
 * Mousemove event handler for canvas - draw on canvas
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function mousemoveForCanvas(event)
{
    var x, y;
    
    // Get the mouse position relative to the canvas element.
    /*if (event.layerX || event.layerX == 0) { // Firefox BUT not relative to canvas element (depending on page's css displays etc)
      x = event.layerX;
      y = event.layerY;
    } else*/ if (event.offsetX || event.offsetX == 0) { // Opera and Chrome
      x = event.offsetX;
      y = event.offsetY;
    }

    //This event handler works like a drawing pencil which tracks the mouse 
    //movements. We start drawing a path made up of lines.
    if(global_mouseButtonDown)
    {
        doDrawOnCanvas(x, y);   //our canvas API magic
    }
}

/**
 * Mouseup event handler for canvas - unset "now drawing" state
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function mouseupForCanvas(event)
{
    //console.log('mouseup event on canvas');
    
    global_mouseButtonDown = false;
    global_startedDrawing = false;
    event.preventDefault(); //need? (maybe not on desktop)
}

/**
 * Universal canvas line plotter. for ontouchmove or onmousemove
 * 
 * @author Daniel Rhodes
 * 
 * @param int canvasX x coord (in canvas space) of touched point
 * @param int canvasY y coord (in canvas space) of touched point
 */
function doDrawOnCanvas(canvasX, canvasY)
{
    //This works like a drawing pencil which tracks the mouse / touch 
    //movements. We start drawing a path made up of lines.
    if(!global_startedDrawing) //first time
    {
        global_canvas.beginPath();
        global_canvas.moveTo(canvasX, canvasY);
        global_startedDrawing = true;
    }
    
    else
    {
        global_canvas.lineTo(canvasX, canvasY);
        global_canvas.stroke();
    }
}

/**
 * Touchstart event handler for canvas
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function touchstartForCanvas(event)
{
    //console.log('touchstart event on canvas');
    
    event.preventDefault();
}

/**
 * Touchmove event handler for canvas - draw on canvas
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function touchmoveForCanvas(event)
{
    //event has pageX and Y (but zero) and layerX and Y (but some static value)
    var touchobj = event.changedTouches[0]; //reference first touch point for this event
        //touchobj has page, client and screen coords (all same)
        
    //where, in canvas space, has been touched?
    var x, y;
    
    var canvasOffset = getPosition(global_canvasElement);   //why no offset x and y for if it's a touch event? :-(
    x = touchobj.screenX - canvasOffset.x;
    y = touchobj.screenY - canvasOffset.y;
  
    doDrawOnCanvas(x, y);
}

/**
 * Touchend event handler for canvas - unset "now drawing" state
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function touchendForCanvas(event)
{
    //console.log('touchend event on canvas');
    
    global_startedDrawing = false;
    
    event.preventDefault();
}

/**
 * Get DOM element position on page
 * 
 * @author Daniel Rhodes
 * @link http://stackoverflow.com/questions/12342438/find-coordinates-of-an-html5-canvas-click-event-with-borders
 * @link http://www.quirksmode.org/js/findpos.html
 * @note a general utility
 * 
 * @param DOMElement obj
 * @return object like {x:someX, y:someY}
 */
function getPosition(obj)
{
    var x = 0, y = 0;
    
    if (obj.offsetParent)
    {
        do
        {
            x += obj.offsetLeft;
            y += obj.offsetTop;
            obj = obj.offsetParent;
        }
        while(obj);
    }
    
    return {'x':x, 'y':y};
};
