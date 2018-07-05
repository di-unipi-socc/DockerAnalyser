import * as utilities from './utilities'

var files = {};
var attributes = {};
var search_attributes = {};  // {attribute: null, type: null, value: null}
var charts = {};

/*var chart = {
    attribute: null,
    type: null,
    labels: null,
    values: null,
    bg_colors: null,
    border_colors: null,
    approximation: null,
}*/


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
 * Returns to an empty state. UNUSED
 */
var reset = function() {
    files = {};
};

// NOTA: quando, dopo il refresh, ricostruisco il form di ricerca, devo verificare che gli attributi 
// che utilizzavo siano ancora presenti e che i tipi coincidano. Cosa faccio se trovo una discrepanza?
// Se l'attributo non c'è più, non lo inserisco; se il tipo è diverso, potrei gestire separatamente 
// tutti i casi, oppure decidere di inserirlo vuoto e lasciare la gestione all'utente

/**
 * Checks the type of each attribute.
 * @param {Object} image a sample image
 */
// Si potrebbe migliorare prendendo un campione di immagini da analizzare
// per cercare di evitare il caso in cui un campo sia nullo nella specifica immagine analizzata
// Come gestisco i null? Si potrebbe ignorarli e fare più chiamate su immagini diverse per cercare di riempirli?
var set_attributes = function(image) {
    $.each(image, function(key, value) {
        // Non consideriamo i campi che iniziano con un underscore, che supponiamo essere privati
        if (key[0] == "_")
            return true;  // continue
        let type = $.type(value);
        if (type == "string" && utilities.is_date(value))
            type = "date_string";
        attributes[key] = type;
    });
};

/**
 * Return all attributes and their type.
 * @returns {Object} all attributes, with their type
 */
var get_attributes = function() {
    return attributes;
};

/**
 * Return all attributes names.
 * @returns {Object} all attribute names
 */
var get_attribute_names = function() {
    return Object.keys(attributes);
};

var get_attribute_type = function(name) {
    return attributes[name];
}

/**
 * Adds a new search attribute to the list, if not already present
 * @param {string} attribute the new search attribute
 * @returns {number} 1 if the attribute was added, 0 otherwise
 */
var add_search_attribute = function(attribute, type) {
    // Se l'attributo che sto cercando di aggiungere è già presente, non lo aggiungo
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
 * @param {number} index index of the chart to remove
 */
var remove_chart = function(attribute, type, approx) {
    let id = get_chart_id(attribute, type, approx);
    delete charts[id];
};

var open_chart = function(attribute, type, approx) {
    let id = get_chart_id(attribute, type, approx);
    charts[id].open = true;
};

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
