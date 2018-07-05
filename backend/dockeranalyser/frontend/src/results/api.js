import * as settings from '../common/settings'
import * as config from './config'
import * as view from './view'

var get_page = function(page, callback, url, params) {
    if (params == null || params == undefined)
        params = {};
    if (url == undefined)
        url = settings.urls.images.list;
    params.page = page;
    params.limit = config.vars.page_size;
    $.getJSON(url, params).done(function(data) {
        callback(data.images, data.count, data.pages);
    })
    .fail(function() {
        view.show_error(settings.msgs.error_server);
        $(config.selectors.results_container).hide();
        $(config.selectors.results_not_ready).show();
        
    });
};

var get_stats = function(attribute, callback) {
    let params = {attribute: attribute};
    $.getJSON(settings.urls.images.stats, params).done(function(data) {
        let output = {};
        $.each(data.values, function(idx, item) {
            output[item.value] = item.count;
        });
        callback(data.min, data.max, data.avg, output);
    })
    .fail(function() {
        view.show_error(settings.msgs.error_server);
    }); 
};

var search = function(params, callback, page) {
    if (page == undefined)
        page = 1;
    get_page(page, callback, settings.urls.images.search, params);
};

export {
    get_page,
    get_stats,
    search
}