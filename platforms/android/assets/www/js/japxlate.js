/**
 * CORE TABBING INFRASTRUCTURE
 * Here we bind and define event listeners for our app's
 * tab navigation and interactivity
 * 
 * @package    JapxlateAndroid (https://github.com/drappenheimer/japxlate-android)
 * @author     Daniel Rhodes
 * @copyright  Copyright (c) 2013-2014 Warp Asylum Ltd (UK) [trading as "Dr Appenheimer"].
 * @license    see LICENCE file in source code root folder     Apache v2.0
 */

/**
 * Has the first load of each tab happened yet?
 */
var global_pagesLoaded = {discover:false, search:false, write:false};

/**
 * tab clickability
 * 
 * @author Daniel Rhodes
 */
function configureTabs()
{
    var tabs = document.querySelectorAll("#tab-bar li a");
    
    for(var loop = 0; loop < tabs.length; loop++)
    {
        var tab = tabs.item(loop);
        tab.addEventListener('click', onclickForTab, false);
    }
}

/**
 * set up and display a newly tapped tab
 * 
 * @author Daniel Rhodes
 */
function onclickForTab(event)
{
    //to prevent URL from changing and browse history building up
    event.preventDefault();
    
    //-------tab display logic---
    var lastTab = document.querySelector('li.current a');
    
    //NOP if clicking current tab again
    if(lastTab == this)
    {
        return false;
    }
    
    lastTab.parentNode.className = ''; //undisplay
    
    this.parentNode.className = 'current';
    //---------------------------
    
    //-----content div display logic---
    var lastDiv = document.querySelector('div.current');
    lastDiv.className = ''; //undisplay
    
    var matchingDiv = this.getAttribute('data-div-id');
    
    var thisDiv = document.getElementById(matchingDiv);
    
    thisDiv.className = 'current';
    //-----------
    
    //get tab div id from tab link
    var divId = this.getAttribute('data-div-id');
    
    onclickForNamedTab(divId);
}

/**
 * Do the one-off loading and everytime setup for whichever tab
 * 
 * @author Daniel Rhodes
 * 
 * @param String divId
 */
function onclickForNamedTab(divId)
{
    if(divId == 'discover')
    {
        onclickForTab_Discover();
    }
    
    else if(divId == 'search')
    {
        onclickForTab_Search();
    }
    
    else if(divId == 'write')
    {
        onclickForTab_Write();
    }
}

/**
 * One-off loading and each time setup for discover tab
 * 
 * @author Daniel Rhodes
 */
function onclickForTab_Discover()
{
    //console.log('click on discover tab');
    
    if(!global_pagesLoaded.discover)
    {
        firstLoadForTab_Discover();
    }
    
    //each time setup to go here
}

/**
 * One-off loading and everytime setup for search tab
 * 
 * @author Daniel Rhodes
 */
function onclickForTab_Search()
{
    //console.log('click on search tab');
    
    if(!global_pagesLoaded.search)
    {
        firstLoadForTab_Search();
    }
    
    //alert('Search');
}

/**
 * One-off loading and everytime setup for write tab
 * 
 * @author Daniel Rhodes 
 */
function onclickForTab_Write()
{
    //console.log('click on write tab');
    
    if(!global_pagesLoaded.write)
    {
        firstLoadForTab_Write();
    }
    
    adjustCanvas(); //adjust - creating if necessary - the canvas element
    
    //get and display a random Japanese character to practice writing
    doNewChar();
}

/**
 * One-off loading for discover tab
 *  
 * @author Daniel Rhodes
 */
function firstLoadForTab_Discover()
{
    //console.log('first load for discover tab');
    
    global_pagesLoaded.discover = true;
    
    //one-off setup to go here
}

/**
 * One-off loading for search tab
 * 
 * @author Daniel Rhodes
 */
function firstLoadForTab_Search()
{
    //console.log('first load for search tab');
    
    tryPopulateDB();
    
    global_pagesLoaded.search = true;
}

/**
 * One-off loading for write tab
 *
 * @author Daniel Rhodes
 */
function firstLoadForTab_Write()
{
    //console.log('first load for write tab');
    
    global_pagesLoaded.write = true;
}

/**
 * Load and show our default initial tab
 * 
 * @author Daniel Rhodes
 */        
function initialiseDefaultTab()
{
    var defaultTab = document.querySelector('div.current');
    
    var divId = defaultTab.id;
    
    onclickForNamedTab(divId);
}
