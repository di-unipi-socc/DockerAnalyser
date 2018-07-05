import * as config from './config'
import * as utilities from './utilities'
import * as model from '../common/model'
import * as view from './view'
import * as vutils from '../common/viewutils'
import * as settings from '../common/settings'
import * as editor from './editor'
import * as requirements from './requirements'

var module_basename = "uploads";
var actions = [{
        name: "add",
        title: "Upload Files",
        icon: "upload",
        style: "info",
        modal: config.selectors.uploads_modal,
        action: function() {
            $("#"+config.selectors.upload_form).show();
            $("#"+config.selectors.upload_package_form).hide();
        },
    }, {
        name: "reset",
        title: "Remove All Uploaded Files",
        icon: "trash-alt",
        style: "danger",
        modal: null,
        action: function() {
            vutils.confirm(settings.msgs.confirm_clear_uploads, reset);
        },
    }
];

var update_length = function() {
    let items = model.get_items();
    let len = 0;
    $.each(items, function(key, item) {
        if (item.uploaded && key != config.req_file.name && key != config.analysis_file.name)
            len++;
    })
    $(config.selectors.uploaded_list_len).html(len);
    if (len == 0)
        $(config.selectors.uploaded_show_list).hide();
    else
        $(config.selectors.uploaded_show_list).show();
};

var remove_file = function(values) {
    editor.remove_item(values.filename);
    model.remove_item(values.filename);
    view.uploader.remove_item(values.filename);
    update_length();
};

var add_uploaded_file = function(filename, file_type, file_content, file_editable, overwrite) {
    if (filename != config.req_file.name && filename != config.analysis_file.name) {
                    
        let edit_button = null;
        if (file_editable) {
            // Edit button is added only if the file is editable
            edit_button = view.get_button("edit", "info");
            edit_button.click(function() { 
                editor.add_item(filename, file_type, file_content);
                view.uploader.set_editing(filename, edit_button);
            });
        }

        let remove_button = view.get_button("trash-alt", "danger");
        remove_button.click(function() { 
            let content = model.get_item(filename);
            let remove_values = {filename: filename};
            if (content.editor && content.editor.getValue() != file_content)
                // If the file was modified, user must confirm he want to remove it
                vutils.confirm(settings.msgs.confirm_remove_file, remove_file, remove_values);
            else
                remove_file(remove_values);
        });
        
        view.uploader.add_item(filename, edit_button, remove_button);
    } else {
        overwrite = true;
        if (filename == config.req_file.name)
            requirements.from_file(file_content);
        if (filename == config.analysis_file.name)
            editor.add_item(config.analysis_file.name, file_type, file_content);
    }
    // Aggiungo il file al model
    model.add_item(filename, file_type, file_content, true, overwrite);
    update_length();
};

/**
 * Removes all uploaded files.
 */
var reset = function() {
    var files = model.get_items();
    $.each(files, function(filename, values) {
        if (values.uploaded && filename != config.analysis_file.name) {
            remove_file({filename: filename});
        }
    });
};

var upload_files = function(event) {
    var uploaded_files = $("#"+config.selectors.upload_input).prop("files");  // FileList object
    let errors = [];
    
    $.each(uploaded_files, function(idx, uploaded_file) {
        var file_type = uploaded_file.type;
        var filename = uploaded_file.name;
        if (model.get_item(filename) != null && filename != config.req_file.name) {
            errors.push(filename);
            return true;  // continue
        }

        var file_editable = utilities.is_editable(file_type);
        var reader = new FileReader();

        reader.onload = (function(current_file) {
            return function(event) {
                let file_content = event.target.result;
                add_uploaded_file(filename, file_type, file_content, file_editable, false);
            };
        })(uploaded_file);

        // Si assume che il file contenga testo 
        // Si assume UTF-8 come encoding utilizzato
        if (file_editable)
            reader.readAsText(uploaded_file);
        else
            reader.readAsBinaryString(uploaded_file);
    });

    if (errors.length > 0) {
        let full_error_msg = settings.msgs.error_file_exists + ": " + errors.join();
        modal.error(config.selectors.uploads_modal, full_error_msg);
    }
};

var init = function() {
    view.uploader.setup_upload_modal();
    vutils.setup_action_buttons(module_basename, actions);
    
    $("#"+config.selectors.upload_form).submit(function(event) {
        event.preventDefault();
        view.uploader.hide_modal();
        upload_files();
    });

    $(config.selectors.uploaded_show_list).click(
        function(event) {
            event.preventDefault();
            $(config.selectors.uploaded_list_id).collapse("toggle");
        }
    );
    $(config.selectors.uploaded_show_list).hide();
};

export {
    init,
    reset,
    add_uploaded_file
};
