/**
 * Requirements module.
 * Handles the Python requirements search and validation.
 * @module editor/requirements
 */

import * as config from './config'
import * as utilities from './utilities'
import * as settings from '../common/settings'
import * as model from '../common/model'
import * as vutils from '../common/viewutils'
import * as modal from '../common/modals'
import * as view from './view'

var module_basename = "requirements";
var items = {};  // example: {"pika": "2.0.5"}
var versions_cache = {};
var actions = [{
        name: "search",
        title: "Search Dependencies",
        icon: "search",
        style: "info",
        modal: config.selectors.req_modal_id,
        action: function() {
            view.requirements.empty_modal_container();
        },
    }, {
        name: "upload",
        title: "Upload Dependencies File",
        icon: "upload",
        style: "info",
        modal: config.selectors.uploads_modal,
        action: function() {
            $("#"+config.selectors.upload_form).show();
            $("#"+config.selectors.upload_package_form).hide();
        },
    }, {
        name: "preview",
        title: "Preview requirements.txt",
        icon: "file-alt",
        style: "info",
        modal: config.selectors.req_preview_modal,
        action: function() {
            view.requirements.preview(generate_file_content());
        },
    }, {
        name: "reset",
        title: "Remove All Dependencies",
        icon: "trash-alt",
        style: "danger",
        modal: null,
        action: function() {
            vutils.confirm(settings.msgs.confirm_clear_requirements, reset);
        },
    }
];

/**
 * @returns {Object} the object containing the selected libraries and their version
 */
var get_items = function() {
    return items;
};

/**
 * Adds a new library to the selected dependencies. 
 * Updates the view showing the new library and the corresponding available actions.
 * @param {string} name the library name
 * @param {string} version the library version
 */
var add_item = function(name, version) {
    // If the library was already in the list, it should not be added 
    // (in both the list and the DOM) but only the corresponding version must be updated
    if (items.hasOwnProperty(name)) {
        items[name] = version;
        view.requirements.replace_selected_version(name, version);
        return;
    }
    items[name] = version;
    let remove_button = view.get_button("trash-alt", "danger");
    remove_button.click(function() { remove_item(name); });
    let versions_button = view.get_button("edit", "info");
    versions_button.click(function() {
        replace_versions(name, version, true, function(new_ver) {
            items[name] = new_ver;
        });
        versions_button.remove();
    });
    view.requirements.add_item(name, version, versions_button, remove_button);
    view.requirements.update_length(items);
};

/**
 * Removes a selected dependency from the list and updates the DOM accordingly.
 * @param {string} name the library name
 */
var remove_item = function(name) {
    delete items[name];
    view.requirements.remove_item(name);
    view.requirements.update_length(items);
};

/**
 * Gets all available versions for a specific library and orders them.
 * Versions obtained and ordered are maintained in an object called versions_cache.
 * The request is forwarded to the server only if the requested library is not found in the versions_cache.
 * @param {string} libname the library name
 * @param {function(string[])} callback the function called after the versions are obtained
 */
var get_versions = function(libname, callback) {
    // libname was found on the versions cache
    if (versions_cache.hasOwnProperty(libname)) {
        callback(versions_cache[libname]);
        return;
    }
    // libname was not found on the versions cache and is requested to the server
    $.getJSON(settings.urls.versions.replace("LIB", libname))
        .done(function(data){
            var versions = [];
            $.each(data.releases, function(ver, val) {
                let upload = "2000-01-01T00:00:00";
                if (val.length > 0)
                    upload = val[0]["upload_time"];
                versions.push({"version": ver, "upload_time": upload});
            });
            versions.sort(utilities.version_compare);
            var results = [];
            $.each(versions, function(idx, item) {
                results.push(item.version);
            });
            versions_cache[libname] = results;
            if (callback)
                callback(results);
        }).fail(function() {
            modal.error(config.selectors.req_modal_id, settings.msgs.error_server);
        });
};

/**
 * Replaces the existing selected version for a library with the select input  
 * containing the list of all available versions for the same library.
 * Called when the "versions" button is clicked for a specific library.
 * @param {string} libname the library name
 * @param {function(string[])} callback the function called after the versions are obtained
 */
var replace_versions = function(libname, last_version, in_list, callback) {
    get_versions(libname, function(versions) {
        view.requirements.replace_versions(libname, versions, last_version, in_list, callback);
    });
};

/**
 * Full-text search of a library given its name (or part of it).
 * 
 * Results are displayed under the search form with the possibility to add
 * the corresponding library of show other versions available (making an
 * additional request to the server for each library).
 * @param {string} name the library name
 */
var search = function(name) {
    modal.clear_errors(config.selectors.req_modal_id);
    $.getJSON(settings.urls.requirements, {"name": name})
        .done(function(data) {
            if (data.results.length > 0) {
                view.requirements.empty_modal_container();
                $.each(data.results, function(idx, val) {
                    let select_button = view.get_text_button("select");
                    let versions_button = view.get_text_button("versions");
                    select_button.click(function() {
                        let ver_val = $("#"+val.name+"_ver_selected").val();
                        add_item(val.name, ver_val);
                        select_button.remove();
                        versions_button.remove();
                    });
                    versions_button.click(function() {
                        replace_versions(val.name, val.version);
                        versions_button.remove();
                    });
                    view.requirements.add_modal_item(val.name, val.version, [select_button, versions_button]);
                });
            } else {
                modal.error(config.selectors.req_modal_id, settings.msgs.error_no_results);
            }
        })
        .fail(function() {
            modal.error(config.selectors.req_modal_id, settings.msgs.error_server);
        });
};

/**
 * Imports requirements from an existing file.
 * 
 * Given the content of a requirements.txt file, checks if all included libraries
 * exist and are included with a proper version. Only correct libraries are automatically
 * included in the requirements list and a message error is generated for the incorrect ones.
 * @param {string} content the requirements.txt file content
 */
var from_file = function(content) {
    var lines = content.split("\n");
    var tmp = [];
    $.each(lines, function(idx, line) {
        if (line.length > 0) {
            var parts = line.split("==");
            tmp.push({"name": parts[0], "version": parts[1]});
        }
    });
    $.getJSON(settings.urls.requirements_validate, {"requirements": JSON.stringify(tmp)})
        .done(function(data) {
            var errors = data.errors;
            $.each(tmp, function(idx, item) {
                if (errors.indexOf(item.name) < 0) {  // No errors found
                    add_item(item.name, item.version);
                }
            });
            if (errors.length > 0) {  // Some errors found (library or version not found)
                let full_error_msg = settings.msgs.error_req_not_found + errors.join();
                modal.error(config.selectors.uploads_modal, full_error_msg);
            }
        })
        .fail(function() {
            modal.error(config.selectors.uploads_modal, settings.msgs.error_server); 
        });
};

/**
 * For all selected dependencies, concatenates the library name with the version name,
 * preparing the content for the requirements.txt file.
 * @returns {string[]} an array containing the lines of the requirements.txt file
 */
var generate_file_content = function() {
    var lines = [];
    $.each(items, function(pkg, ver) {
        let line = pkg + "==" + ver;
        lines.push(line);
    })
    return lines;
};

/**
 * Generates the requirements.txt file using the selected dependencies and their versions.
 * The generated file is added to the model.
 */
var generate_file = function() {
    let content = generate_file_content().join("\n");
    let req = config.req_file;
    model.add_item(req.name, req.type, content, false, true);
};

/**
 * Removes all selected requirements.
 */
var reset = function() {
    $.each(items, function(name, version) {
        remove_item(name);
    });
    model.remove_item(config.req_file.name);
};

/**
 * Initialises the requirements manager.
 * Setups modals and form actions.
 */
var init = function() {
    view.requirements.setup_search_modal();
    view.requirements.setup_view_modal();
    vutils.setup_action_buttons(module_basename, actions);

    $("#"+config.selectors.req_add_form).submit(function(event) {
        event.preventDefault();
        let name = $("#"+config.selectors.req_title).val();
        if (name)
            search(name);
    });

    $(config.selectors.req_show_list).click(
        function(event) {
            event.preventDefault();
            $(config.selectors.req_container_id).collapse("toggle");
        }
    );
    $(config.selectors.req_show_list).hide();
};

export {
    init,
    reset,
    get_items,
    generate_file,
    from_file
};
