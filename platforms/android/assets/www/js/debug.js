/**
 * Useful JavaScript debugging functions. an optional file.
 * 
 * @package    JapxlateAndroid (https://github.com/drappenheimer/japxlate-android)
 * @author     Daniel Rhodes
 * @copyright  Copyright (c) 2013-2014 Warp Asylum Ltd (UK) [trading as "Dr Appenheimer"].
 * @license    see LICENCE file in source code root folder     Apache v2.0
 */

/**
 * Dump a JavaScript object into a readable string form
 * 
 * @author Daniel Rhodes
 * @todo intelligent switching of newline character ("\n" or <br>) based on caller or context or what-have-you
 * @todo recursion when value itself is another object?
 * 
 * @param object someObject the object to examine
 * @return string dump of the object with one line for each member item in format of "[itemName] = itemValue"
 */
function debugDump(someObject)
{
	var dump = '';
	
	for(var item in someObject)
	{
		dump += '[' + item + ']' + ' = ' + someObject[item] + '\n';
	}
	
	return dump;
}

/**
 * alert() a dump of a JavaScript object
 * 
 * @author Daniel Rhodes
 * 
 * @param object someObject the object to alert a dump of
 * @return void
 */
function debugAlert(someObject)
{
	alert(debugDump(someObject));
}

/**
 * Append a message to a "console" div (which looks nice
 * when styled with autoscroll and a monospace font!).
 * Note that we don't simply do innerHTML += whatever
 * because memory usage (and CPU time) can accumulate!
 * Note also that the optionalConsoleElementId defaults to 'console'
 * 
 * @author Daniel Rhodes
 * 
 * @param string message the message to log in the console
 * @param string optionalConsoleElementId optional element id of the console div. defaults to 'console'
 * @return void
 */
function debugLog(message, optionalConsoleElementId)
{
	var p = document.createElement('p');
	
	p.innerHTML = message;
	
	var theElementId = optionalConsoleElementId || 'console';
	
	try
	{
		document.getElementById(theElementId).appendChild(p);
	}
	
	catch(error)
	{
		//NOP if failure (ie. element id doesn't exist in page)
	}
}
