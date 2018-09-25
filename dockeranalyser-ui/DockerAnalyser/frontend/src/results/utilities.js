/**
 * Results utilities.
 * @module results/utilities
 */

/**
 * Generates hexadecimal colors usable in charts.
 * The objective is to generate "evenly spaced" colours.
 * @see {@link https://stackoverflow.com/a/7419630|Adam Cole, 2011-Sept-14}
 * @see {@link http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript|HSV to RBG}
 * @param {number} num the total number of different colors that will be generated
 * @param {number} step the id of the current color
 * @returns {string} the hexadecimal color code, ready to be used in CSS (including #)
 */
export function rainbow(num, step) {
    var r, g, b;
    var h = step / num;
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

/**
 * Given an hexadecimal color codes, lightens it.
 * @see {@link https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors}
 * @param {string} color the hexadecimal color code
 * @param {number} amount how much you want to lighten
 * @returns {string} the hexadecimal lightened color code
 */
export function lighten(color, amount) {
    var usePound = false;
    if (color[0] == "#") {
        color = color.slice(1);
        usePound = true;
    }
    var num = parseInt(color, 16);

    var r = (num >> 16) + amount;
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + amount;
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;

    var g = (num & 0x0000FF) + amount;
    if (g > 255) g = 255;
    else if  (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}

/**
 * Transforms an array formed by strings rapresenting integers
 * to an array composed by actual integers.
 * @param {string[]} items the original array
 * @returns {number[]} the same array, composed by integers
 */
export function array_to_int(items) {
    var ints = [];
    for (let i=0; i<items.length; i++)
        ints.push(parseInt(items[i], 10));
    return ints;
}

/**
 * Capitalizes the first letter of a given string.
 * @param {string} str the string you want to modify
 * @returns {string} the modified string
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Makes an attribute name more readable by replacing underscores with spaces.
 * @param {string} str the string you want to modify
 * @returns {string} the modified string
 */
export function readable(str) {
    return str.replace(/_/g, ' ');
}

/**
 * Makes a float number more readable formatting it (using dots and comas) in the local style.
 * @param {number} num the number to format
 * @returns {string} the formatted number
 */
export function format_number(num) {
    return num.toLocaleString(undefined, {useGrouping:true, maximumFractionDigits:2});
}

/**
 * Verifies if a field name is acceptable: it must not contain spaces and it can only
 * contain unaccented letters, numbers, dots and underscores.
 * @param {string} str the string you want to check
 * @returns {boolean} true if the string is acceptable, false otherwise
 */
export function acceptable_field_name(str) {
    return str.match(/^[\w.]+$/);
}
