/**
 * Global model, maintains the status of the whole application.
 * @module common/model
 */

import * as utilities from './utilities'

/**
 * Complete list of files added to the package.
 * It includes the analysis file, the requirements file and all user-uploaded files.
 * @type {Object}
 * @example files[filename] = {type: mimetype, content: "", uploaded: false, editor: null}
 */
var files = {};

/**
 * Image attributes found on the sample image.
 * @type {Object} 
 * @example attributes[attribute] = type;
 */
var attributes = {};

/**
 * Attributes selected for the custom search form.
 * @type {Object} 
 * @example search_attributes[attribute] = {attribute: attribute, type: "string", value: ""}
 */
var search_attributes = {};

/**
 * Custom charts created by the user.
 * @type {Object}
 * @example chart[id] = {type: "pie", attribute: attribute, approx: "others", open: true}
 */
var charts = {};

/**
 * Adds a file to the list or overwrites an existing file.
 * @param {string} filename name of the file
 * @param {string} type file mime type
 * @param {string} content file content
 * @param {boolean} uploaded true if the file has been uploaded by the user
 * @param {boolean} overwrite true in case the file should be overwritten if already present
 */
var add_item = function(filename, type, content, uploaded, overwrite) {
    if (files.hasOwnProperty(filename)) {
        if (overwrite) {
            files[filename].type = type;
            files[filename].content = content;
            files[filename].uploaded = uploaded;
        }
        return;
    }
    // Files gets added or overwritten
    files[filename] = {
        type: type,
        content: content, 
        uploaded: uploaded,
        editor: null
    };
};

/**
 * Removes an existing file.
 * @param {string} filename name of the file
 */
var remove_item = function(filename) {
    delete files[filename];
};

/**
 * Updates one or more attributes of an existing file.
 * Only updates the specified attributes. 
 * Valid attribute names are: type, content, uploaded, editor
 * @param {string} filename name of the file
 * @param {Object} values object containing the new values for each attribute
 */
var update_item = function(filename, values) {
    if (files.hasOwnProperty(filename)) {
        $.each(values, function(key, val) {
            files[filename][key] = val;
        });
    }
};

/**
 * If present, returns all attributes of a specific file.
 * @param {string} filename name of the file
 * @returns {Object} the corresponding file object or null if not found
 */
var get_item = function(filename) {
    if (files.hasOwnProperty(filename))
        return files[filename];
    return null;
};

/**
 * Exports all files.
 * @returns {Object} all current files
 */
var get_items = function() {
    return files;
}

/**
 * Checks the type of each attribute from a sample image.
 * @param {Object} image a sample image
 */
var set_attributes = function(image) {
    $.each(image, function(key, value) {
        // If an attribute starts with an underscore, we consider it private and ignore it
        if (key[0] == "_")
            return true;  // continue
        let type = $.type(value);
        if (type == "string" && utilities.is_date(value))
            type = "date_string";
        attributes[key] = type;
    });
};

/**
 * Returns all attributes and their type.
 * @returns {Object} all attributes, with their type
 */
var get_attributes = function() {
    return attributes;
};

/**
 * Returns all attributes names.
 * @returns {Object} all attribute names
 */
var get_attribute_names = function() {
    return Object.keys(attributes);
};

/**
 * Returns the type of a single attribute.
 * @param {string} name the attribute name
 * @returns {string} the attribute type
 */
var get_attribute_type = function(name) {
    return attributes[name];
}

/**
 * Adds a new search attribute to the list, if not already present.
 * @param {string} attribute the new search attribute
 * @param {string} type the attribute type
 * @returns {number} 1 if the attribute was added, 0 otherwise
 */
var add_search_attribute = function(attribute, type) {
    // If the attribute is already on the list, we skip it
    if (!search_attributes.hasOwnProperty(attribute)) {
        search_attributes[attribute] = {type: type, value: null};
        return 1;
    }
    return 0;
};

/**
 * Removes an existing search attribute
 * @param {string} attribute the attribute to remove
 * @returns {number} 1 if the attribute was removed, 0 otherwise
 */
var remove_search_attribute = function(attribute) {
    if (search_attributes.hasOwnProperty(attribute)) {
        delete search_attributes[attribute];
        return 1;
    }
    return 0;
};

/**
 * Returns all search attributes
 * @returns {Object} all search attributes
 */
var get_search_attributes = function() {
    return search_attributes;
};

/**
 * Returns the number of search attributes
 * @returns {number} the number of search attributes
 */
var len_search_attributes = function() {
    return Object.keys(search_attributes).length;
};

/**
 * Replaces all search attributes
 * @param {Object} attributes new search attributes
 */
let update_search_attributes = function(attributes) {
    search_attributes = attributes;
};

/**
 * Removes all search attributes
 */
let clear_search_attributes = function() {
    search_attributes = {};
}

/**
 * Generates a unique id for a new chart.
 * @param {string} attribute the selected attribute
 * @param {string} type the chart type
 * @param {string} approx the approximation method
 * @returns {string} the new chart id
 */
let get_chart_id = function(attribute, type, approx) {
    return attribute +  "_" + type + "_" + approx;
};

/**
 * Adds a new chart to the list
 * @param {Object} chart the new chart
 * @returns {number} 1 if the chart was added, 0 otherwise
 */
var add_chart = function(chart) {
    let id = get_chart_id(chart.attribute, chart.type, chart.approx);
    if (!charts.hasOwnProperty(id)) {
        chart.open = true;
        charts[id] = chart;
        return 1;
    }
    return 0;
};

/**
 * Removes an existing chart
 * @param {string} attribute the chart attribute
 * @param {string} type the chart type
 * @param {string} approx the chart approximation method
 */
var remove_chart = function(attribute, type, approx) {
    let id = get_chart_id(attribute, type, approx);
    delete charts[id];
};

/**
 * Sets a specific chart as open
 * @param {string} attribute the chart attribute
 * @param {string} type the chart type
 * @param {string} approx the chart approximation method
 */
var open_chart = function(attribute, type, approx) {
    let id = get_chart_id(attribute, type, approx);
    charts[id].open = true;
};

/**
 * Sets a specific chart as closed
 * @param {string} attribute the chart attribute
 * @param {string} type the chart type
 * @param {string} approx the chart approximation method
 */
var close_chart = function(attribute, type, approx) {
    let id = get_chart_id(attribute, type, approx);
    charts[id].open = false;
};

/**
 * Return all charts added to the interface
 * @returns {Object} all charts
 */
var get_charts = function() {
    return charts;
};

export {
    add_item,
    get_items,
    remove_item,
    update_item,
    get_item,
    reset,
    set_attributes,
    get_attributes,
    get_attribute_names,
    get_attribute_type,
    add_search_attribute,
    remove_search_attribute,
    clear_search_attributes,
    get_search_attributes,
    len_search_attributes,
    update_search_attributes,
    add_chart,
    remove_chart,
    get_charts,
    open_chart,
    close_chart
};
