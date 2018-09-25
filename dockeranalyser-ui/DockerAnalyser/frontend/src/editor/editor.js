/**
 * Editor module.
 * Uses ACE Editor {@link https://ace.c9.io}.
 * @module editor/editor
 */

import * as config from './config'
import * as model from '../common/model'
import * as view from './view'
import * as settings from '../common/settings'
import * as modal from '../common/modals'
import * as utilities from './utilities'
import * as uploader from './uploader'

/**
 * Adds a new file to the editor or overwrites an existing file content.
 * @param {string} filename name of the file
 * @param {string} type file mime type
 * @param {string} content file content
 */
var add_item = function(filename, type, content) {
    let item = model.get_item(filename);
    if (item && item.editor != null) {
        // If the file is already open, its content gets overwritten
        item.editor.setValue(content, 1);
    } else {
        // Create new editor and update model with editor reference
        let editor = view.editor.add_element(filename, type, content);
        model.update_item(filename, {"editor": editor, "content": content});
    }
};

/**
 * If present, removes a specific file from the editor.
 * @param {string} filename name of the file
 */
var remove_item = function(filename) {
    let item = model.get_item(filename); 
    if (item) { // Superfluo?
        view.editor.remove_tab(filename);
        view.editor.show_first_tab();
    }
};

/**
 * Adds a new empty tab to the editor.
 */
var add_empty_file = function() {
    let filename = $.trim($("#"+config.selectors.add_file_name).val());
    if (filename == "") {
        modal.error(config.selectors.add_file_modal, settings.msgs.error_empty_filename);
        return;
    }
    if (model.get_item(filename) != null) {
        modal.error(config.selectors.add_file_modal, settings.msgs.error_file_exists);
        return;
    }
    modal.hide(config.selectors.add_file_modal);
    let filetype = utilities.get_filetype(filename);
    model.add_item(filename, filetype, "", false, true);
    uploader.add_uploaded_file(filename, filetype, "", false, true);
    add_item(filename, filetype, "");
};

/**
 * Initialises the editor loading the analysis file.
 */
var init = function() {
    let file = config.analysis_file;
    model.add_item(file.name, file.type, file.content, false, true);
    add_item(file.name, file.type, file.content);
};

export {
    init, 
    add_item,
    remove_item,
    add_empty_file
};
