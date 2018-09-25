/**
 * Packager module.
 * @module editor/packager
 */

import * as config from './config'
import * as utilities from './utilities'
import * as model from '../common/model'
import * as settings from '../common/settings'
import * as vutils from '../common/viewutils'
import * as modal from '../common/modals'
import * as view from './view'
import * as editor from './editor'
import * as uploader from './uploader'
import * as requirements from './requirements'

var JSZip = require("jszip");
var FileSaver = require('file-saver');

var module_basename = "package";
var actions = [{
        name: "suggestions",
        title: "Available Methods",
        icon: "list",
        style: "info",
        modal: config.selectors.suggestions_modal,
        action: null,
    },{
        name: "import",
        title: "Upload Package",
        icon: "upload",
        style: "info",
        modal: config.selectors.uploads_modal,
        action: function() {
            $("#"+config.selectors.upload_form).hide();
            $("#"+config.selectors.upload_package_form).show();
        },
    }, {
        name: "export",
        title: "Export Package",
        icon: "download",
        style: "info",
        modal: config.selectors.export_modal,
        action: null,
    }, {
        name: "reset",
        title: "Reset Work Area",
        icon: "trash-alt",
        style: "danger",
        modal: null,
        action: function() {
            vutils.confirm(settings.msgs.confirm_reset, reset);
        },
    }
];

/**
 * Checks if the analysis.py source code is valid. 
 * If an error is found, it will display an error message, otherwise 
 * it will execute the callback provided.
 * @param {string} content the python source code
 * @param {function} callback the function called if the validation is successful
 */
var validate = function(content, callback, error_callback) {
    $.getJSON(settings.urls.code_validate, {"code": JSON.stringify(content)})
        .done(function(data) {
            var errors = data.errors;
            if (errors.length > 0) {
                let full_error_msg = errors.join("<br>");
                if (error_callback)
                    error_callback(full_error_msg);
                else {
                    errors.push(full_error_msg);
                    modal.error(config.selectors.export_modal, settings.msgs.error_validation);
                }
            } else {
                callback();
            }
        })
        .fail(function() {
            modal.error(config.selectors.export_modal, settings.msgs.error_server);
        });
};

/**
 * Returns to the initial state.
 */
var reset = function() {
    uploader.reset();
    requirements.reset();
    editor.init();
};

/**
 * Creates a zip with all files.
 * @param {function(string, string)} callback the function called if the zip creation is successful
 */
var create_zip = function(callback, error_callback) {
    let zip = new JSZip();
    let zip_name = config.vars.base_zip_name + utilities.normalise($("#"+config.selectors.export_name).val());
    let folder = zip.folder(zip_name);
    let files = model.get_items();
    let analysis_content;
    $.each(files, function(key, values){
        let file_content = values.content;
        if (values.editor)
            file_content = values.editor.getValue();
        let options = {};
        if (!values.type.match('text.*'))
            options["binary"] = true;
        folder.file(key, file_content, options);
        if (key == config.analysis_file.name)
            analysis_content = file_content;
    });
    validate(analysis_content, function(){
        zip.generateAsync({type: "blob"}).then(function(content) {
            callback(content, zip_name);
        });
    }, error_callback);
};

/**
 * Exports all files in a .zip file.
 */
var export_zip = function() {
    create_zip(function(content, zip_name) {
        FileSaver.saveAs(content, zip_name+".zip");
    });
};

/**
 * Opens a .zip file and loads its contained files in the work area.
 * If a file is recognised as editable, it will be possible to modify in the editor.
 * @param {string} data the .zip content
 */
var load_from_zip = function(data) {
    var new_zip = new JSZip();
    new_zip.loadAsync(data).then(function(zip) {
        zip.forEach(function (relativePath, file){
            if (!file.dir) {
                let filename = utilities.get_filename(relativePath);
                let file_type = utilities.get_filetype(filename);
                if (utilities.is_editable(file_type)) {
                    file.async("string").then(function(content) {
                        uploader.add_uploaded_file(filename, file_type, content, true, true);
                    });
                } else {
                    file.async("binarystring").then(function(content) {
                        uploader.add_uploaded_file(filename, file_type, content, false, true);
                    });
                }
            }
        });
    });
}

/**
 * Uploads a full package provided in a .zip file, showing its content in the work area.
 */
var upload_package = function() {
    var uploaded_files = $("#"+config.selectors.upload_package_input).prop("files");  // FileList object
    var uploaded_file = uploaded_files[0];

    // Package validation: it must be a .zip file
    var zip_type = uploaded_file.type;
    if (zip_type != "application/zip") {
        moda.error(config.selectors.uploads_modal, settings.msgs.error_wrong_type);
        return;
    }
    var zipname = uploaded_file.name; 
    var reader = new FileReader();

    reader.onload = (function(current_file) {
        return function(event) {
            reset();
            let file_content = event.target.result;
            // Apertura zip e lettura contenuto
            load_from_zip(file_content);
        };
    })(uploaded_file);
    reader.readAsBinaryString(uploaded_file);
};

/**
 * Gets the last uploaded .zip package, if available.
 * If not available, server will return the default package.
 */
var get_package = function() {
    let options = {
        url: settings.urls.compose.upload,
        processData: false,
        xhrFields: {responseType: 'arraybuffer'}
    };
    $.get(options).done(function(data, status, xhr) {
        /*var type = xhr.getResponseHeader('Content-Type');
        var disposition = xhr.getResponseHeader('Content-Disposition');
        if (disposition && disposition.indexOf('attachment') !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            var matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) 
                filename = matches[1].replace(/['"]/g, '');
            console.log("filename", filename);
        }*/
        load_from_zip(data);
      })
      .fail(function(xhr, status, error) {
        vutils.show_error(settings.msgs.error_server, config.vars.step_id);
      });
}

/**
 * Setups the suggestions modal, showing the available context['images'] methods.
 */
var setup_suggestions = function() {
    $.getJSON(settings.urls.suggestions)
        .done(function(data) {
            view.packager.setup_suggestions_modal(data.results);
        })
        .fail(function() {
            modal.error(config.selectors.suggestions_modal, settings.msgs.error_server);
        });
};

/**
 * Initialises the package manager.
 */
var init = function() {
    get_package();
    setup_suggestions();
    view.packager.setup_export_modal();
    vutils.setup_action_buttons(module_basename, actions);

    $("#"+config.selectors.export_form).submit(function(event) {
        event.preventDefault();
        requirements.generate_file();
        export_zip();
    });

    $("#"+config.selectors.upload_package_form).submit(function(event) {
        event.preventDefault();
        vutils.confirm(settings.msgs.confirm_upload_zip, upload_package, null);
    });
};

export {
    init,
    create_zip
};
