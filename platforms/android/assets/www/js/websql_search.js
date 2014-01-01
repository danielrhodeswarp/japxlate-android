/**
 * Web SQL functionality to handle dictionary searching
 * 
 * @package    JapxlateAndroid (https://github.com/drappenheimer/japxlate-android)
 * @author     Daniel Rhodes
 * @copyright  Copyright (c) 2013-2014 Warp Asylum Ltd (UK) [trading as "Dr Appenheimer"].
 * @license    see LICENCE file in source code root folder     Apache v2.0
 */

/**
 * User's search term as a global variable (so we can access it from all
 * the different callbacks). Hmmm... 
 */
var global_searchTerm = null;

/**
 * Maximum number of search results to return for any query
 */
var global_maxResultsCount = 40;

/**
 * Master function to query the database based on whatever query string
 * 
 * There are two search routes based on if the search term is in Japanese
 * or English.
 * If English then we try the following match priorities (stopping
 * when we get at least one match):
 * [1] term matches an edict definition fragment EXACTLY
 * [2] term is included in an edict definition fragment
 * [3] term assumed to be romaji, converted to hiragana, matches exactly an
 *     edict "kana" field entry
 * If Japanese then:
 * [1] term matches an edict "kanji" field entry EXACTLY
 * [2]term matches an edict "kana" field entry EXACTLY
 * 
 * @author Daniel Rhodes
 * 
 * @param string newQ user's search term
 */
function doEdictQueryOn(newQ)
{
    //set global_searchTerm
    global_searchTerm = newQ;
    
    //version 1.0, 4 megabytes
    var db = window.openDatabase("Japxlate", "1.0", "Japxlate DB", 4 * 1024 * 1024);
    
    if(is_mb(global_searchTerm))    //Japanese (or at least multibyte)
    {
        //console.log('doing as japanese - kanji');
        db.transaction(queryDB_ja, errorWebSQL);
    }
    
    else       //ie. English (or - as last resort - romaji)
    {
        //console.log('doing as english - exact');
        db.transaction(queryDB_en, errorWebSQL);
    }
}

/**
 * Callback for if queryDB_ja() did not error (which includes zero results)
 * Print kanji matches if we have ELSE try kana matches
 * 
 * @author Daniel Rhodes
 * @todo can recycle the tx object?
 * 
 * @param SQLTransaction tx
 * @param SQLResultSet results
 */
function successQueryDB_ja(tx, results)
{
    if(results.rows.length == 0)    //no kanji matches - try kana matches
    {
        //console.log('no ja kanji matches');

        //TODO already have the tx object so do we even need to open the db again?
        //version 1.0, 4 megabytes
        var db = window.openDatabase("Japxlate", "1.0", "Japxlate DB",
            4 * 1024 * 1024);

        db.transaction(queryDB_ja_kana, errorWebSQL);
    }
   
    else
    {
        putResultsOnPage(results);
    } 
}

/**
 * Callback for if queryDB_ja_kana() did not error (which includes zero results)
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLTransaction tx
 * @param SQLResultSet results
 */
function successQueryDB_ja_kana(tx, results)
{
    putResultsOnPage(results);
}

/**
 * Callback for if queryDB_en() did not error (which includes zero results)
 * Print exact matches if we have ELSE try partial matches
 * 
 * @author Daniel Rhodes
 * @todo recycle tx
 * 
 * @param SQLTransaction tx
 * @param SQLResultSet results
 */
function successQueryDB_en(tx, results)
{
    if(results.rows.length == 0)    //no exact matches - try partial matches
    {
        //console.log('no en exact matches');
        //alert('no en exact matches');return;
        
        //version 1.0, 4 megabytes
        var db = window.openDatabase("Japxlate", "1.0", "Japxlate DB", 4 * 1024 * 1024);
    
        db.transaction(queryDB_en_partial, errorWebSQL);
    }
   
    else
    {
        putResultsOnPage(results);
    } 
}

/**
 * Callback for if queryDB_en_partial() did not error (which includes zero results)
 * Print partial matches if we have ELSE try romaji matches
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLTransaction tx
 * @param SQLResultSet results
 */
function successQueryDB_en_partial(tx, results)
{
    if(results.rows.length == 0)    //no partial matches - try as romaji
    {
        //console.log('no en partial matches');
        //alert('no en partial matches');return;     
        
        //version 1.0, 4 megabytes
        var db = window.openDatabase("Japxlate", "1.0", "Japxlate DB", 4 * 1024 * 1024);
    
        db.transaction(queryDB_en_romaji, errorWebSQL);
       
    }
    
    else
    {
        putResultsOnPage(results);
    } 
}

/**
 * Callback for if queryDB_en_romaji() did not error (which includes zero results)
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLTransaction tx
 * @param SQLResultSet results
 */
function successQueryDB_en_romaji(tx, results)
{
    putResultsOnPage(results);
}

/**
 * Search edict for an exact English match
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLTransaction tx
 */
function queryDB_en(tx)
{
    var safeQ = global_searchTerm;  //how to escape?
    
    //no escaping of anything (ie. single quotes)
    //tx.executeSql("SELECT * FROM edict WHERE definition LIKE '%/" + safeQ + "/%' LIMIT " + global_maxResultsCount, [], successQueryDB_en, errorWebSQL);
    
    //use placeholders (so don't need to escape)
    //seems to escape single quotes
    //not sure if '%' mark is being escaped at all...
    tx.executeSql("SELECT * FROM edict WHERE definition LIKE ? LIMIT " + global_maxResultsCount, ['%/' + safeQ + '/%'], successQueryDB_en, errorWebSQL);
}

/**
 * Search edict for a partial English match
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLTransaction tx
 */
function queryDB_en_partial(tx)
{
    var safeQ = global_searchTerm;  //how to escape?
    
    //tx.executeSql("SELECT * FROM edict WHERE definition LIKE '%" + safeQ + "%' LIMIT " + global_maxResultsCount, [], successQueryDB_en_partial, errorWebSQL);
    
    //use placeholders (so don't need to escape)
    tx.executeSql("SELECT * FROM edict WHERE definition LIKE ? LIMIT " + global_maxResultsCount, ['%' + safeQ + '%'], successQueryDB_en_partial, errorWebSQL);
}

/**
 * Search edict for a romaji match
 * 
 * @author Daniel Rhodes
 * @todo kana conversion
 * 
 * @param SQLTransaction tx
 */
function queryDB_en_romaji(tx)
{
    var safeQ = global_searchTerm;  //how to escape?
    var safeQKana = romaji_to_hira(global_searchTerm);
    
    //TODO I don't think this is matching for when kana is actually in katakana
    //(how to configure Web SQL collation?)
    //tx.executeSql("SELECT * FROM edict WHERE kana LIKE '" + safeQKana + "' LIMIT " + global_maxResultsCount, [], successQueryDB_en_romaji, errorWebSQL);
    
    //use placeholders (so don't need to escape)
    tx.executeSql("SELECT * FROM edict WHERE kana LIKE ? LIMIT " + global_maxResultsCount, [safeQKana], successQueryDB_en_romaji, errorWebSQL);
}

/**
 * Search edict for an exact kanji match
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLTransaction tx
 */
function queryDB_ja(tx)
{
    var safeQ = global_searchTerm;  //how to escape?
    
    //tx.executeSql("SELECT * FROM edict WHERE kanji = '" + safeQ + "' LIMIT " + global_maxResultsCount, [], successQueryDB_ja, errorWebSQL);
    
    //use placeholders (so don't need to escape)
    tx.executeSql("SELECT * FROM edict WHERE kanji = ? LIMIT " + global_maxResultsCount, [safeQ], successQueryDB_ja, errorWebSQL);
}

/**
 * Search edict for an exact kana match
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLTransaction tx
 */
function queryDB_ja_kana(tx)
{
    var safeQ = global_searchTerm;
    
    //use placeholders (so we don't need to escape the query)
    tx.executeSql("SELECT * FROM edict WHERE kana = ? LIMIT " + global_maxResultsCount, [safeQ], successQueryDB_ja_kana, errorWebSQL);
}
