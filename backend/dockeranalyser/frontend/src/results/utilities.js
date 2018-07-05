import * as config from './config'

/**
 * Normalises a string removing spaces and special characters.
 * @param {string} str the string you want to normalise
 * @returns {string} the normalised string
 */
export function normalise(str) {
    return str.replace(/[^a-z0-9_\-]/gi, "").toLowerCase();
}

/**
 * Made to be used by the sort function, compares two objects based on their upload_time filed.
 * This fileld should contain a timestamp in the form: "2000-01-01T00:00:00"
 * Objects are ordered from the newest to the oldest.
 * Usage example: versions.sort(version_compare)
 * @param {Object} a an object with and upload_time field
 * @param {Object} b an object with and upload_time field
 * @returns {number} depends on which one is older
 */
export function version_compare(a, b){
    if (a == null || b == null)
        return b;
    return Date.parse(b["upload_time"]) - Date.parse(a["upload_time"]);
}

/**
 * Extracts the file name, given its full path.
 * @param {string} path full path to the file
 * @returns {string} the file name
 */
export function get_filename(path) {
    let filename = path.split("/");
    if (filename.length > 1)
        filename = filename[filename.length-1];
    else
        filename = filename[0];
    return filename;
}

// https://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
export var toType = function(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}

// https://stackoverflow.com/a/7419630
export function rainbow(numOfSteps, step) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 0.9; g = f; b = 0.1; break;
        case 1: r = q; g = 0.9; b = 0.1; break;
        case 2: r = 0.1; g = 0.9; b = f; break;
        case 3: r = 0.1; g = q; b = 0.9; break;
        case 4: r = f; g = 0.1; b = 0.9; break;
        case 5: r = 0.9; g = 0.1; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}

// https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
export function LightenDarkenColor(color, amt) {
    var usePound = false;
    if ( color[0] == "#" ) {
        color = color.slice(1);
        usePound = true;
    }
    var num = parseInt(color, 16);

    var r = (num >> 16) + amt;
    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amt;
    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amt;
    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;

    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

export function array_to_int(items) {
    var ints = [];
    for (let i=0; i<items.length; i++)
        ints.push(parseInt(items[i], 10));
    return ints;
}

// https://www.regextester.com/97766
export function is_date(str) {
    return str.match(/^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$/);
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function readable(str) {
    return str.replace(/_/g, ' ');
}

export function format_number(num) {
    return num.toLocaleString(undefined, {useGrouping:true, maximumFractionDigits:2});
}

export function acceptable_field_name(str) {
    return str.match(/^[\w.]+$/);
}
