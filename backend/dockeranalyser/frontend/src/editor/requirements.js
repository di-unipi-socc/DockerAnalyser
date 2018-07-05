import * as config from './config'
import * as utilities from './utilities'
import * as settings from '../common/settings'
import * as model from '../common/model'
import * as vutils from '../common/viewutils'
import * as modal from '../common/modals'
import * as view from './view'
import * as editor from './editor'

var module_basename = "requirements";
var items = {};  // {"pika": "2.0.5"}
var versions_cache = {};
var actions = [{
        name: "search",
        title: "Search Dependencies",
        icon: "search",
        style: "info",
        modal: config.selectors.req_modal_id,
        action: null,
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

var update_length = function() {
    let keys = Object.keys(items);
    let len = keys.length;
    $(config.selectors.req_list_len).html(len);
    if (len == 0)
        $(config.selectors.req_show_list).hide();
    else
        $(config.selectors.req_show_list).show();
};

var remove_item = function(name) {
    delete items[name];
    view.requirements.remove_item(name);
    update_length();
};

var add_item = function(name, version) {
    // Se è già presente, la versione viene sovrascritta e non devo aggiungerlo nel DOM
    // Devo però potenzialmente modificare la versione visualizzata
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
    update_length();
};

var get_items = function() {
    return items;
};

var get_versions = function(libname, callback) {
    if (versions_cache.hasOwnProperty(libname)) {
        callback(versions_cache[libname]);
        return;
    }
    
    $.getJSON(settings.urls.versions.replace("LIB", libname))
        .done(function(data){
            var versions = [];
            $.each(data.releases, function(ver, val) {
                let upload = "2000-01-01T00:00:00";
                if (val.length > 0)
                    upload = val[0]["upload_time"];
                versions.push({"version": ver, "upload_time": upload});
            });
            //versions.sort(natsort({ desc: true }));
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

var replace_versions = function(libname, last_version, in_list, callback) {
    get_versions(libname, function(versions) {
        view.requirements.replace_versions(libname, versions, last_version, in_list, callback);
    });
};

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
                view.requirements.show_modal();
            } else {
                modal.error(config.selectors.req_modal_id, settings.msgs.error_no_results);
            }
        })
        .fail(function() {
            modal.error(config.selectors.req_modal_id, settings.msgs.error_server);
        });
};

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
                if (errors.indexOf(item.name) < 0) {  // Non ha generato un errore
                    add_item(item.name, item.version);
                }
            });
            if (errors.length > 0) {
                let full_error_msg = settings.msgs.error_req_not_found + errors.join();
                modal.error(config.selectors.uploads_modal, full_error_msg);
            }
        })
        .fail(function() {
            modal.error(config.selectors.uploads_modal, settings.msgs.error_server); 
        });
};

var generate_file_content = function() {
    var lines = [];
    $.each(items, function(pkg, ver) {
        let line = pkg + "==" + ver;
        lines.push(line);
        //txt = txt + line;
    })
    return lines;
};

var generate_file = function() {
    var keys = Object.keys(items);
    /*if (keys.length == 0)
        return;*/
    let content = generate_file_content().join("\n");
    let req = config.req_file;
    model.add_item(req.name, req.type, content, false, true);
    //editor.add_item(req.name, req.type, content);
};

var reset = function() {
    $.each(items, function(name, version) {
        remove_item(name);
    });
    editor.remove_item(config.req_file.name);
    model.remove_item(config.req_file.name);
};

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
