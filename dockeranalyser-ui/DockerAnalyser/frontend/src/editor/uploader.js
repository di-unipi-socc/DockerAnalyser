/**
 * Uploader module.
 * Handles file uploads.
 * @module editor/uploader
 */

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
        name: "add_new",
        title: "Add Empty File",
        icon: "plus",
        style: "info",
        modal: config.selectors.add_file_modal,
        action: null,
    },{
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

/**
 * Uploads one or more files.
 * 
 * Uses the HTML5 File APIs to read the file content.
 * Files are added to the model and, if they are recognised as text files, 
 * can be opened and modified in the editor. If they are not recognised as 
 * text files, they will not be editable but will be included in the .zip export.
 * If any uploaded file is named requirements.txt, it will be rejected and an error 
 * will be shown to the user. In case of other name conflict, the previous file 
 * content will be overwritten by the last uploaded file content with the same name.
 */
var upload_files = function() {
    var uploaded_files = $("#"+config.selectors.upload_input).prop("files");  // FileList object
    let errors = [];
    
    $.each(uploaded_files, function(idx, uploaded_file) {
        var file_type = uploaded_file.type;
        var filename = uploaded_file.name;
        // Any file named requirements.txt is rejected
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

        if (file_editable)  // Assuming the file contains text ad is UTF-8 encoded
            reader.readAsText(uploaded_file);
        else
            reader.readAsBinaryString(uploaded_file);
    });

    if (errors.length > 0) {
        let full_error_msg = settings.msgs.error_file_exists + ": " + errors.join();
        modal.error(config.selectors.uploads_modal, full_error_msg);
    }
};

/**
 * Inserts a single file in the model and updates the DOM
 * showing the corresponding actions.
 * If the uploaded file is analisys.py or requirements.txt it will be overwritten.
 * @param {string} filename the file name
 * @param {string} file_type the file type
 * @param {string} file_content the file content
 * @param {boolean} file_editable true if the file contains text
 * @param {boolean} overwrite true if should be overwritten in case it already exists
 */
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
        if (filename == config.req_file.name)  // Should load the requirements
            requirements.from_file(file_content);
        if (filename == config.analysis_file.name)  // Should open the file in the editor
            editor.add_item(config.analysis_file.name, file_type, file_content);
    }
    // The uploaded file is added to the model
    model.add_item(filename, file_type, file_content, true, overwrite);
    view.uploader.update_length(model.get_items());
};

/**
 * Removes a previously uploaded file from the model and, 
 * in case it was open, from the editor too.
 * @param {Object} values an object defining the file; must have a filename attribute
 * @param {string} values.filename the name of the file to remove
 */
var remove_file = function(values) {
    editor.remove_item(values.filename);
    model.remove_item(values.filename);
    view.uploader.remove_item(values.filename);
    view.uploader.update_length(model.get_items());
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

/**
 * Initialises the uploads manager.
 * Setups modals and form actions.
 */
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

    // New empty file
    view.editor.setup_newfile_modal();
    $("#"+config.selectors.add_file_form).submit(function(event) {
        event.preventDefault();
        editor.add_empty_file();
    });
    
};

export {
    init,
    reset,
    add_uploaded_file
};
