import * as config from './config'
import * as utilities from './utilities'
import * as model from '../common/model'
import * as vutils from '../common/viewutils'
import * as settings from '../common/settings'
import * as view from './view'
import * as search from './search'
import * as graphs from './graphs'
import * as api from './api'

var module_basename = "results";
var actions = [{
    name: "refresh",
    title: "Refresh",
    icon: "sync",
    style: "info",
    modal: null,
    action: function() {
        refresh();
    },
}, {
    name: "export",
    title: "Export",
    icon: "download",
    style: "info",
    modal: null,
    action: function() {
        export_images();
    },
}];

var show_results_overview = function(attribute, container_id) {
    api.get_stats(attribute, function(min, max, avg, output) {
        let container = $(container_id);
        container.empty();
        if (min)
            container.append("<li><strong>Min</strong>: " + utilities.format_number(min) + "</li>");
        if (max)
            container.append("<li><strong>Max</strong>: " + utilities.format_number(max) + "</li>");
        if (avg)
            container.append("<li><strong>Average</strong>: " + utilities.format_number(avg) + "</li>");
        vutils.fix_height(config.vars.step);
    });
};

var results_overview = function() {
    show_results_overview("star_count", "#stars_results ul");
    show_results_overview("pull_count", "#pulls_results ul");
};

var load_first_page = function() {
    api.get_page(1, function(images, count, pages) {
        $(config.selectors.results_container).show();
        $(config.selectors.results_not_ready).hide();
        view.results.show_total(count);
        if (count > 0) {
            $(".results_container_box").show();
            $("#results_export").show();
            model.set_attributes(images[0]);
            graphs.set_charts_attribute_list();
            search.set_search_attribute_list();
            $("#"+config.selectors.sample_image_div).empty();
            $("#"+config.selectors.sample_image_div).append(vutils.display_object(images[0], 0));
        } else {
            $(".results_container_box").hide();
            $("#results_export").hide();
        }
        vutils.fix_height(config.vars.step);
    });
};

// https://stackoverflow.com/questions/16086162/handle-file-download-from-ajax-post
var export_images = function() {
    let url = settings.urls.images.export;
    console.log(url);
    let options = {
        type: "GET",
        data: {},
        url: url,
        processData: false,
        contentType: false,
        cache: false,
        xhrFields: {responseType: 'arraybuffer'}
    };
    $.ajax(options).done(function(response, status, xhr) {
        let type = xhr.getResponseHeader('Content-Type');
        var disposition = xhr.getResponseHeader('Content-Disposition');
        let filename = "docker-analyser-images.zip";
        if (disposition && disposition.indexOf('attachment') !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) 
                filename = matches[1].replace(/['"]/g, '');
        }
        var blob = new Blob([response], { type: type });
        var URL = window.URL || window.webkitURL;
        var downloadUrl = URL.createObjectURL(blob);
        
        // use HTML5 a[download] attribute to specify filename
        var a = document.createElement("a");
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();    
      })
      .fail(function(xhr, status, error) {
          console.log("ERROR");
          console.log(xhr);
          console.log(status);
          console.log(error);
      });
}

var refresh = function() {
    vutils.clean_messages(config.vars.step_id);
    // Reload first page, to get new total
    load_first_page();
    // Reload pull and stars stats
    results_overview();
    // Reload charts
    graphs.refresh();
    // Search form stays as it is: we use the first image as template, so it cannot be changed
    // Reload the search results
    search.search();
};

var init = function() {
    $(config.selectors.results_container).hide();
    vutils.setup_action_buttons(module_basename, actions);
    //$("#results_stop").hide();
    search.init(config.selectors.results_container);
    graphs.init(config.selectors.results_container);
    
    load_first_page();
    results_overview();

    $(config.selectors.reload_button).click(function(event) {
        event.preventDefault();
        refresh();
    });
};

export {
    init,
    refresh
}
