/**
 * The look and feel of searching and search results
 * 
 * @package    JapxlateAndroid (https://github.com/drappenheimer/japxlate-android)
 * @author     Daniel Rhodes
 * @copyright  Copyright (c) 2013-2014 Warp Asylum Ltd (UK) [trading as "Dr Appenheimer"].
 * @license    see LICENCE file in source code root folder     Apache v2.0
 */

//----global variables----------------------------------------------------------

/**
 * used for simulated touch scrolling with mouse
 */
var global_mouseButtonDown = false;

/**
 * current 'top' css value (in pixels) of our scrollable div
 */
var global_scrollDivTop;

/**
 * current height (in pixels) of our scrollable div's content (used to activate scrolling if needed and for scroll locking)
 */
var global_scrollDivHeight;

/**
 * start y axis position (in pixels) of the current scroll
 */
var global_scrollStartY;

/**
 * height (in pixels) of our viewport over the scrollable div (used to activate scrolling)
 */
var global_scrollWindowHeight;

//----/end global variables-----------------------------------------------------

/**
 * Clean up the EDICT definition line that we get from our Web SQL DB
 * For example, "/one/two/three/" --> "one; two; three"
 * 
 * @author Daniel Rhodes
 * 
 * @param string slashesString original definition line from EDICT DB
 * @return string cleaned up definition line
 */
function format_slashes(slashesString)
{
    //remove leading and trailing '/' characters
    var string = slashesString.replace(/^\//, ''); //leading
    var string = string.replace(/\/$/, ''); //trailing
    
    //change remaining '/' characters to a semicolon with space
    return string.replace(/\//g, '; ');
}

/**
 * Put the matching search results (which could be zero matches) on the page
 * 
 * @author Daniel Rhodes
 * @link http://stackoverflow.com/questions/16785199/highlight-matched-text-with-case-sensitive-for-auto-suggestion
 * @todo prob need escape to q in the regex *and* the replacement
 * 
 * @param SQLResultSet results
 */
function putResultsOnPage(results)
{
    //get search results div
    var theDiv = document.getElementById('search-results');
    
    //clear current content
    theDiv.innerHTML = '';
    
    //reset Y position because it might have changed after some touch scrolling frenzy!
    theDiv.style.top = '0';
    
    //might be no matches
    if(results.rows.length === 0)
    {
        theDiv.innerHTML = 'No matches found in the common words dictionary.\
            Tweet @japxlate yourAdvancedWord for advanced word definitions.';
        buttonSpinnerVisible(false);    //stop the loading spinner
        return;
    }
    
    //some results so loop through and print
    for(var loop = 0; loop < results.rows.length; loop++)
    {
        var item = results.rows.item(loop);
        
        var theRomaji = kana_to_romaji(item.kana);
        //var theRomaji = item.kana;
        var formattedDefinition = format_slashes(item.definition);
        
        var defText = item.kanji + ' / ' + item.kana + ' (' + theRomaji + ') / ' + formattedDefinition;
        defText = defText.replace(new RegExp(global_searchTerm, 'ig'), '<span style="color:#990000;">$&</span>');
        
        var defLine = '<img src="img/j.png" style="vertical-align:middle;"> ' + defText + '<hr>';
        //var defLine = '<p class="def-line"> ' + defText + '</p>'; //had CSS styling issues (mostly text overflow)
        
        theDiv.innerHTML += defLine;
    }
    
    buttonSpinnerVisible(false);    //stop the loading spinner
}

/**
 * Clear the "database is loading" message
 * 
 * @author Daniel Rhodes
 */
function clearLoadingMessage()
{
    document.getElementById('loading-text').innerHTML = '';
}

/**
 * Toggle for search button's loading spinner
 * 
 * @author Daniel Rhodes
 * 
 * @param bool visible set to false to hide the spinner
 */
function buttonSpinnerVisible(visible)
{
    var spinner = document.getElementById('button-spinner');
    
    if(visible)
    {
        spinner.style.visibility = 'visible';
    }
    
    else
    {
        spinner.style.visibility = 'hidden';
    }
}

/**
 * Toggle for search results scroll hint
 * 
 * @author Daniel Rhodes
 * @todo merge with buttonSpinnerVisible() ????
 * 
 * @param bool visible set to false to hide the scroll hint
 */
/*
function scrollHintVisible(visible)
{
    var hint = document.getElementById('scroll-hint');
    
    if(visible)
    {
        hint.style.display = 'block';
    }
    
    else
    {
        hint.style.display = 'none';
    }
}
*/

/**
 * search button clickability
 * 
 * @author Daniel Rhodes
 */
function configureSearchButton()
{
    document.getElementById('search-button').addEventListener('click', onclickForSearchButton, false);
}

/**
 * Perform a dictionary search for entered query
 * 
 * @author Daniel Rhodes
 * @todo some kind of trim() method
 * 
 * @param Event event
 */
function onclickForSearchButton(event)
{
    //console.log(event);
    
    var q = document.getElementById('search-query').value;  //escape here?
    
    //some kanji searches are going to be legitimately only one char.
    //we need a trim() function instead...
    if(q.length < 1)
    {
        return;
    }
    
    buttonSpinnerVisible(true);
    
    var matches = doEdictQueryOn(q);
}

/**
 * search box ENTER keypress
 * 
 * @author Daniel Rhodes
 */
function configureSearchInput()
{
    document.getElementById('search-query').
                addEventListener('keypress', onkeyForSearchInput, false);
}

/**
 * Simulate a "normal" HTML form input by allowing an ENTER press in the
 * query input to perform the same as clicking the search button
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 * //@return bool but needed?? "return false" not cancelling the keypress in chrome or android
 */
function onkeyForSearchInput(event)
{
    //.charCode or .keyCode ??
    if(event.keyCode == 13) //ENTER key
    {
        //trigger already registered "click" handler
        document.getElementById('search-button').click();
    }
}

/**
 * configure touch dragging for search results
 * 
 * @author Daniel Rhodes
 */
function configureSearchTouchScrolling()
{
    document.getElementById('search-results')
            .addEventListener('touchstart', touchstartForSearchResults, false);
    
    document.getElementById('search-results')
            .addEventListener('touchmove', touchmoveForSearchResults, false);
    
    document.getElementById('search-results')
            .addEventListener('touchend', touchendForSearchResults, false);                //even adding this doesn't stop the "drag event missed" warnings
}

/**
 * Touchstart event handler for search results div - initiates touch scrolling
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function touchstartForSearchResults(event)
{
    //console.log('touchstart');
    
    touchobj = event.changedTouches[0]; //reference *first* touch point
  
    startVerticalDragScrolling(this, touchobj.clientY);
    
    event.preventDefault(); //prevent default tap behavior
}

/**
 * Touchmove event handler for search results div - performs touch scrolling
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function touchmoveForSearchResults(event)
{
    //console.log('touchmove');
    
    touchobj = event.changedTouches[0]; //reference first touch point for this event
    
    doVerticalDragScrolling(this, touchobj.clientY);
    
    event.preventDefault();
}

/**
 * Touchend event handler for search results div
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function touchendForSearchResults(event)
{
    //console.log('touchend');
}

/**
 * Universal initialise (vertical) scroll. for ontouchstart or onmousedown.
 * 
 * @author Daniel Rhodes
 * 
 * @param DOMElement elementToScroll the div that we are moving
 * @param int eventClientY clientY of the event
 */
function startVerticalDragScrolling(elementToScroll, eventClientY)
{
    //console.log('initialise scrolling');
    
    var theStyle = window.getComputedStyle(elementToScroll);
    
    global_scrollDivTop = parseInt(theStyle.top);  //get 'top' value of box
    global_scrollStartY = parseInt(eventClientY); // get x coord of touch point
    
    global_scrollDivHeight = parseInt(theStyle.height); //get 'height' value of box
    
    //work out height of #search-results versus height of results
    //pane (which is .japxlate_app.height - #search-form.height)
    global_scrollWindowHeight =
        parseInt(
            window.getComputedStyle(
                document.querySelector('.japxlate_app')
            ).height, 10) -
            
            parseInt(
                window.getComputedStyle(
                    document.querySelector('#search-form')
            ).height);
}

/**
 * Universal perform (vertical) scroll. for ontouchmove or onmousemove.
 * 
 * @author Daniel Rhodes
 * 
 * @param DOMElement elementToScroll the div that we are moving
 * @param int eventClientY clientY of the event
 * @return ?? only if scroll lock
 */
function doVerticalDragScrolling(elementToScroll, eventClientY)
{
    //console.log('do scrolling');
    
    //if height of results content is less than height of results pane,
    //we have no content overflow and so don't need to scroll    
    if(global_scrollDivHeight < global_scrollWindowHeight)
    {
        //console.log('no overflow');
        return;
    }
    
    //calculate distance travelled by touch point
    var distance = parseInt(eventClientY) - global_scrollStartY;
    
    //new CSS top for elementToScroll
    var newTop = global_scrollDivTop + distance;
    
    //disallow scrolling bottom of content higher than bottom of results pane
    //(using height of results pane)
    if(newTop < ((0 - global_scrollDivHeight) + global_scrollWindowHeight))
    {
        //console.log('top cushion');
        return; //return false??
    }
    
    //disallow scrolling top of content lower than top of results pane
    if(newTop > 0)
    {
        //console.log('bottom cushion');
        return; //return false?
    }
    
    //set the new top value for the div we are moving
    elementToScroll.style.top = newTop + 'px';
}

/**
 * configure mouse dragging for search results
 * 
 * @author Daniel Rhodes
 */
function configureSearchMouseScrolling()
{
    //simulated touch (ie. mouse) dragging for results
    document.getElementById('search-results')
            .addEventListener('mousedown', mousedownForSearchResults, false);
    
    document.getElementById('search-results')
            .addEventListener('mousemove', mousemoveForSearchResults, false);
    
    document.getElementById('search-results')
            .addEventListener('mouseup', mouseupForSearchResults, false);
}

/**
 * Mousedown event handler for search results div - initiates simulated touch scrolling
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function mousedownForSearchResults(event)
{
    //console.log('mousedown event on scrollable');
    
    global_mouseButtonDown = true;  //set global
    
    startVerticalDragScrolling(this, event.clientY);
    
    event.preventDefault(); //prevent default click behaviour (ie. select text or whatever)
}

/**
 * Mousemove event handler for search results div - performs simulated touch scrolling
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function mousemoveForSearchResults(event)
{
    //console.log('mousemove event on scrollable');
    
    if(!global_mouseButtonDown)
    {
        return false;   //do nothing if the mouse button isn't pressed down
        //false is ok to return?
    }
    
    doVerticalDragScrolling(this, event.clientY);
    
    event.preventDefault();
}

/**
 * Mouseup event handler for search results div
 * 
 * @author Daniel Rhodes
 * 
 * @param Event event
 */
function mouseupForSearchResults(event)
{
    //console.log('mouseup event on scrollable');
    
    global_mouseButtonDown = false;
    event.preventDefault(); //need?
}
