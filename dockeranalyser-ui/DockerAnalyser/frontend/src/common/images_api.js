/**
 * Images API module.
 * Interacts with the backend to retrieve the analysed images.
 * @module common/images_api
 */

import * as settings from '../common/settings'

/**
 * Retrives one page of results from the image server
 * @param {number} page the requested page, 1 if undefined
 * @param {function(array, number, number)} callback function to call in case of success
 * @param {function} error_callback function to call in case of error
 * @param {string} url different url to call
 * @param {object} params additional parameters to send to the server
 */
var get_page = function(page, callback, error_callback, url, params) {
    if (params == null || params == undefined)
        params = {};
    if (url == undefined)
        url = settings.urls.images.list;
    params.page = page;
    params.limit = settings.vars.page_size;
    $.getJSON(url, params).done(function(data) {
        if (callback)
            callback(data.images, data.count, data.pages);
    })
    .fail(function() {
        if (error_callback)
            error_callback();
    });
};

/**
 * Retrives aggregated values of a particular attribute from the image server
 * @param {string} attribute the requested attribute
 * @param {function} callback function to call in case of success
 * @param {function} error_callback function to call in case of error
 */
var get_stats = function(attribute, callback, error_callback) {
    let params = {attribute: attribute};
    $.getJSON(settings.urls.images.stats, params).done(function(data) {
        let output = {};
        $.each(data.values, function(idx, item) {
            output[item.value] = item.count;
        });
        if (callback)
            callback(data.min, data.max, data.avg, output);
    })
    .fail(function() {
        if (error_callback)
            error_callback();
    }); 
};

/**
 * Searches through the analysed images and retrives one page of results from the image server
 * @param {object} params additional parameters to send to the server
 * @param {function} callback function to call in case of success
 * @param {function} error_callback function to call in case of error
 * @param {number} page the requested page, 1 if undefined
 */
var search = function(params, callback, error_callback, page) {
    if (page == undefined)
        page = 1;
    get_page(page, callback, error_callback, settings.urls.images.search, params);
};

export {
    get_page,
    get_stats,
    search
}