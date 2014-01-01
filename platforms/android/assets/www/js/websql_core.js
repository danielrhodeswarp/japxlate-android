/**
 * Web SQL database creation and population (and Web SQL generic things)
 * 
 * @package    JapxlateAndroid (https://github.com/drappenheimer/japxlate-android)
 * @author     Daniel Rhodes
 * @copyright  Copyright (c) 2013-2014 Warp Asylum Ltd (UK) [trading as "Dr Appenheimer"].
 * @license    see LICENCE file in source code root folder     Apache v2.0
 */

/**
 * @note that error callbacks will receive cb(transaction ,error)
 * if fired from tx.executeSql().
 * if fired from db.transaction() they receive only cb(error)
 * isn't that a pip!
 */

/**
 * Open / create the "Japxlate" Web SQL database and - if it's not already
 * present - create and populate the "edict" table
 * 
 * @author Daniel Rhodes
 */
function tryPopulateDB()
{
    //version 1.0, 4 megabytes
    var db = window.openDatabase("Japxlate", "1.0", "Japxlate DB", 4 * 1024 * 1024);
    
    db.transaction(checkDB/*, errorCheckDB*/);  //only populate edict table if it not already exist
}

/**
 * Check if "edict" table exists and has records
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLTransaction tx
 */
function checkDB(tx)
{
    //console.log('checkDB()');
    
    tx.executeSql('SELECT COUNT(id) AS count FROM edict', [], successCheckDB, errorCheckDB);
}

/**
 * Callback for if checkDB() fails - ie. no "edict" table
 * SO create it and fill it
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLError error
 * @returns bool false (but can't remember what for?!)
 */
function errorCheckDB(transaction, error)
{   
    //console.log('tx in errorCheckDB(): ' + transaction);
    //console.log('error in errorCheckDB(): ' + error);
    
    //console.log('edict table not exist - will create and fill');
    
    //version 1.0, 4 megabytes
    var db = window.openDatabase("Japxlate", "1.0", "Japxlate DB", 4 * 1024 * 1024);
    
    db.transaction(populateDB, errorWebSQL, successPopulate);
    
    //return false;
}

/**
 * Callback for if checkDB() succeeds - ie. "edict" table present and full
 * SO clear the "database loading" message
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLTransaction tx
 * @param SQLResultSet results
 */
function successCheckDB(tx, results)
{
    //console.log('edict already loaded');
    
    clearLoadingMessage();  //remove "database loading" message
    //document.getElementById('loading-text').innerHTML = '';
}

/**
 * Create and fill the "edict" table
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLTransaction tx
 */
function populateDB(tx)
{
    //console.log('creating and filling edict table');
    
    //DROP if present (ie. because it's present but empty)
    tx.executeSql('DROP TABLE IF EXISTS edict');
    
    //create
    tx.executeSql('CREATE TABLE IF NOT EXISTS edict(id unique, kanji, kana, definition)');
    
    websqlEdictInserts(tx); //see websql_edict_inserts.js
}

/**
 * Generic SQLError handler (for both db.transaction() and tx.executeSQL())
 * 
 * @author Daniel Rhodes
 * 
 * @param SQLError|SQLTransaction error object (from db.transaction()) or transaction object (from tx.executeSQL())
 * @param SQLError|null error object (from tx.executeSQL()) or null (from db.transaction())
 * @returns bool false (but can't remember what for?!)
 */
function errorWebSQL(transactionOrError, errorOrNull)
{   
    var error = null;
    
    if(typeof transactionOrError == 'SQLTransaction') {
        error = errorOrNull;
    } else {
        error = transactionOrError;
    }
    
    //console.log(error); //error is now an SQLError object
    
    alert("Error processing SQL: " + error.code);
    //debugAlert(error);
    //return false;
}

/**
 * Callback for if errorCheckDB() succeeds - ie. "edict" table populated OK
 * 
 * @author Daniel Rhodes
 */
function successPopulate()
{
    //console.log('finished loading edict');
    
    clearLoadingMessage();  //remove "database loading" message
    //document.getElementById('loading-text').innerHTML = '';
}
