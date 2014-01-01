/**
 * Japanese (and general utf8 multibyte) string conversion and handling
 * 
 * @package    JapxlateAndroid (https://github.com/drappenheimer/japxlate-android)
 * @author     Daniel Rhodes
 * @copyright  Copyright (c) 2013-2014 Warp Asylum Ltd (UK) [trading as "Dr Appenheimer"].
 * @license    see LICENCE file in source code root folder     Apache v2.0
 */

//----character tables----------------------------------------------------------

/**
 * All single character hiragana (in "biggest" first order)
 * 
 * @author Daniel Rhodes
 * @todo 'ゔ' for 'vu' ????
 * @link http://en.wikipedia.org/wiki/Kana
 */
var coreHiragana =
[
    'が', 'ぎ', 'ぐ', 'げ', 'ご',
    'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
    'だ', 'ぢ', 'づ', 'で', 'ど',
    'ば', 'び', 'ぶ', 'べ', 'ぼ',
    'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や',       'ゆ',       'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'ゐ',       'ゑ', 'を',
    'ん', 'っ',
    'あ', 'い', 'う', 'え', 'お',
    'ゃ',       'ゅ',       'ょ',
    'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ',
];

/**
 * All single character katakana (in "biggest" first order)
 * 
 * @author Daniel Rhodes
 * @note must correspond with coreHiragana
 */
var coreKatakana =
[
    'ガ', 'ギ', 'グ', 'ゲ', 'ゴ',
    'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ',
    'ダ', 'ヂ', 'ヅ', 'デ', 'ド',
    'バ', 'ビ', 'ブ', 'ベ', 'ボ',
    'パ', 'ピ', 'プ', 'ペ', 'ポ',
    'カ', 'キ', 'ク', 'ケ', 'コ',
    'サ', 'シ', 'ス', 'セ', 'ソ',
    'タ', 'チ', 'ツ', 'テ', 'ト',
    'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
    'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
    'マ', 'ミ', 'ム', 'メ', 'モ',
    'ヤ',       'ユ',       'ヨ',
    'ラ', 'リ', 'ル', 'レ', 'ロ',
    'ワ', 'ヰ',       'ヱ', 'ヲ',
    'ン', 'ッ',
    'ア', 'イ', 'ウ', 'エ', 'オ',
    'ャ',       'ュ',       'ョ',
    'ァ', 'ィ', 'ゥ', 'ェ', 'ォ',
];

/**
 * Transliterations of coreHiragana
 * 
 * @author Daniel Rhodes
 * @note must correspond with coreHiragana
 * @note we preserve chiisai tsu for later processing and cleaning up (ie. double the next consonant or etc)
 */
var coreRomaji =
[
    'ga', 'gi', 'gu', 'ge', 'go',
    'za', 'ji', 'zu', 'ze', 'zo',
    'da', 'di', 'du', 'de', 'do',
    'ba', 'bi', 'bu', 'be', 'bo',
    'pa', 'pi', 'pu', 'pe', 'po',
    'ka', 'ki', 'ku', 'ke', 'ko',
    'sa', 'shi', 'su', 'se', 'so',
    'ta', 'chi', 'tsu', 'te', 'to',
    'na', 'ni', 'nu', 'ne', 'no',
    'ha', 'hi', 'fu', 'he', 'ho',
    'ma', 'mi', 'mu', 'me', 'mo',
    'ya',       'yu',       'yo',
    'ra', 'ri', 'ru', 're', 'ro',
    'wa', 'wi',       'we', 'wo',
    'n',  'ッ',  //preserve chiisai tsu
    'a',  'i',  'u',  'e',  'o',
    'ya',       'yu',       'yo',
    'a',  'i',  'u',  'e',  'o',
];

/**
 * All "combination" katakana
 * 
 * @author Daniel Rhodes
 * @note mostly for kana <--> romaji
 */
var comboKatakana =
[
    'チャ', 'チュ', 'チェ', 'チョ',
    'シャ', 'シュ', 'シェ', 'ショ',
    'ジャ', 'ジュ', 'ジェ', 'ジョ',
    'キャ', 'キュ',        'キョ',
    'ギャ', 'ギュ',        'ギョ',
           'リュ',         'リョ',
    'ミャ', 'ミュ',         'ミョ',
    'ヒャ', 'ヒュ',         'ヒョ',
    'ニャ', 'ニュ',         'ニョ',
    'ビャ', 'ビュ',         'ビョ',
    'ピャ', 'ピュ',         'ピョ',
    'ヂャ', 'ヂュ',         'ヂョ',
    'ファ', 'フィ', 'フェ', 'フォ',
           'ウィ', 'ウェ',  'ウォ',
    'ヴァ', 'ヴィ', 'ヴェ', 'ヴォ',
           'ティ',
           'ディ'
];

/**
 * Transliterations of comboKatakana
 * 
 * @author Daniel Rhodes
 * @note mostly for kana <--> romaji
 * @note must correspond with comboKatakana
 */
var comboRomaji =
[
    'cha', 'chu', 'che', 'cho',
    'sha', 'shu', 'she', 'sho',
    'ja',  'ju',  'je',  'jo',
    'kya', 'kyu',        'kyo',
    'gya', 'gyu',        'gyo',
           'ryu',        'ryo',
    'mya', 'myu',        'myo',
    'hya', 'hyu',        'hyo',
    'nya', 'nyu',        'nyo',
    'bya', 'byu',        'byo',
    'pya', 'pyu',        'pyo',
    'dya', 'dyu',        'dyo',
    'fa',  'fi',  'fe',  'fo',
           'wi',  'we',  'wo',
    'va',  'vi',  've',  'vo',
           'ti',
           'di'
];

//----/end character tables-----------------------------------------------------

/**
 * Return a random (non-chiisai, non-obsolete) hiragana or katakana
 * 
 * @author Daniel Rhodes
 * 
 * @return object like {char:'く', romaji:'ku', type:'hiragana'}
 */
function getRandomKana()
{
    //indices to ignore from coreHiragana:
    //64,65,68,>=74
    //so this is indices of coreHiragana of chars that we WANT to practice
    //(ie. not chiisai or obsolete):
    var coreIndices =
    [
        0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
        10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
        30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
        40, 41, 42, 43, 44, 45, 46, 47, 48, 49,
        50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
        60, 61, 62, 63, 66, 67, 69, 70, 71, 72,
        73
    ];
    
    //get one of above indices at random
    var index = coreIndices[Math.floor(Math.random() * coreIndices.length)];
    
    //default to hiragana...
    var char = coreHiragana[index]; //use our random index
    var type = 'hiragana';
    
    //...but have a 50% chance of returning katakana
    if(Math.random() > 0.50)
    {
        char = hira_to_kata(char);
        type = 'katakana';
    }
    
    //return a useful object
    return {char:char, romaji:kana_to_romaji(char), type:type};
}

/**
 * Does the given utf8 string have multibyte characters or not?
 * 
 * @author Daniel Rhodes
 * 
 * @param string utf8String
 * @returns bool true if utf8String has multibyte characters in it
 */
function is_mb(utf8String)
{
    return utf8String.length != mb_bytelen(utf8String);
}

/**
 * Get length in BYTES of a utf8 string
 * 
 * @author Daniel Rhodes
 * @link http://stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
 * 
 * @param string utf8String
 * @returns int count of *bytes* in utf8String
 */
function mb_bytelen(utf8String)
{
    //Matches only the 10.. bytes that are non-initial characters
    //in a multi-byte sequence.
    var m = encodeURIComponent(utf8String).match(/%[89ABab]/g);
    return utf8String.length + (m ? m.length : 0);
}

/**
 * Here we use prototyping to add a method to the String class to give
 * us the equivalent of PHP's str_replace()
 * 
 * @author Daniel Rhodes
 * @link http://php.net/manual/en/function.str-replace.php
 * @link http://stackoverflow.com/questions/5069464/replace-multiple-strings-at-once
 * 
 * @param char[] find
 * @param char[] replace
 * @return string
 */
String.prototype.str_replace = function(find, replace)
{
    var replaceString = this;
    var regex;
    
    for (var i = 0; i < find.length; i++) {
        regex = new RegExp(find[i], "g");
        replaceString = replaceString.replace(regex, replace[i]);
    }
    
    return replaceString;
};

/**
 * Convert romaji to hiragana
 * 
 * @author Daniel Rhodes
 * @todo get small tsu etc working
 * 
 * @param string romajiString
 * @return string romajiString converted to hiragana
 */
function romaji_to_hira(romajiString)
{
    //replace combos first
    var katakana = romajiString
            .str_replace(comboRomaji, comboKatakana)
            .str_replace(coreRomaji, coreKatakana);
    
    //force hiragana
    return kata_to_hira(katakana);
}

/**
 * Convert hiragana to katakana
 * 
 * @author Daniel Rhodes
 * 
 * @param string hiraganaString
 * @return string hiraganaString converted to katakana
 */
function hira_to_kata(hiraganaString)
{
    return hiraganaString.str_replace(coreHiragana, coreKatakana);
}

/**
 * Convert katakana to hiragana
 * 
 * @author Daniel Rhodes
 * 
 * @param string katakanaString
 * @return string katakanaString converted to hiragana
 */
function kata_to_hira(katakanaString)
{
    return katakanaString.str_replace(coreKatakana, coreHiragana);
}

/**
 * Convert kana (hira or kata) to romaji
 * 
 * @author Daniel Rhodes
 * 
 * @param string kanaString
 * @return string kanaString converted to romaji
 */
function kana_to_romaji(kanaString)
{
    //force katakana
    var kata = hira_to_kata(kanaString);
    
    //transliterate
    var withChiisaiTsu = kata.str_replace(comboKatakana, comboRomaji)
                            .str_replace(coreKatakana, coreRomaji);
    
    //fix any remaining chiisai tsu's
        //before 'chi' (make "tchi")
    var romaji = withChiisaiTsu.replace(/ッchi/g, 'tchi');
        //before anything else (double the consonant)
    romaji = romaji.replace(/ッ([a-z]{1})/g, "$1$1");
    
    //TODO katakana style 'ー' (which might actually be '-' in the input string)
    romaji = romaji.replace(/([^0-9])[-]([^0-9])/g, "$1ー$2");
    romaji = romaji.replace(/([a-z]{1})ー/g, "$1$1");
    
    return romaji;
}
