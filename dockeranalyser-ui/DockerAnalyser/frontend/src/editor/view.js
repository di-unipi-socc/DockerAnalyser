/**
 * Editor view module.
 * @module editor/view
 */

import * as config from './config'
import * as utilities from './utilities'
import * as modal from '../common/modals'
import * as forms from '../common/forms'
import * as settings from '../common/settings'

/**
 * Shows a general error message.
 * @param {string} msg the error message
 */
var show_error = function(msg) {
    let div = $("<div />").attr({"role": "alert", "class": "alert alert-danger alert-dismissible fade show"});
    let close_button = $("<button />").attr({"type": "button", "class": "close", "data-dismiss": "alert", "aria-label": "Close"});
    let close_icon = $("<span />").attr("aria-hidden", "true").html("&times;");
    close_button.append(close_icon);
    div.append(msg);
    div.append(close_button);
    $(config.selectors.error_container).append(div);
};

/**
 * Returns a new button with the provided text.
 * It can be an "info" button or a "danger" button. Info is the default.
 * @param {string} txt text to show inside the button
 * @param {boolean} error if it's requested a "danger" button
 * @returns {jQuery} the jQuery object rapresenting the new button
 */
var get_text_button = function(txt, error) {
    let button_attributes = {
        type: "button",
        class: config.vars.action_btn_class
    }
    let button = $("<button />").attr(button_attributes).html(txt);
    if (error)
        button.addClass("btn-outline-danger");
    return button;
};

/**
 * Returns a new button with the provided icon and style.
 * @param {string} icon the name of the FontAwesome icon desired
 * @param {string} style the boostrap style desired (primary, secondary, success, danger, warning, info, light, dark)
 * @returns {jQuery} the jQuery object rapresenting the new button
 */
var get_button = function(icon, style) {
    let button_attributes = {
        type: "button",
        class: config.vars.action_btn_class
    }
    let button = $("<button />").attr(button_attributes);
    button.addClass("btn-outline-"+style);
    let i = $("<i />").attr("class", "fas fa-"+icon);
    button.append(i);
    return button;
};

/**
 * Returns a string variant of the filename, removing spaces and special 
 * characters, so it can be more easily used as an ID for DOM elements.
 * @param {string} filename the complete file name
 * @returns {string} the normalised file name
 */
var get_basename = function(filename) {
    return utilities.normalise(filename);
};

/**
 * @namespace
 */
var editor = {
    /**
     * Shows the first tab of the code editor.
     */
    show_first_tab: function() {
        $(config.selectors.tab_container_id+" li:first-child a").tab("show");
    },
    /**
     * Adds a new tab button to the code editor.
     * @see {@link https://getbootstrap.com/docs/4.0/components/navs/|Bootstrap Navs}
     * @param {string} filename the complete file name
     * @param {function} on_click function called when the tab name is clicked (if null, the corresponding tab content will be shown)
     */
    add_tab: function(filename, on_click) {
        let basename = get_basename(filename);
        let li = $("<li />").attr("class", "nav-item");
        let a_attributes = {
            "class": "nav-link",
            "data-toggle": "tab",
            "role": "tab",
            "id": basename+"-tab",
            "href": "#"+basename,
            "aria-controls": basename
        };
        let a = $("<a />").attr(a_attributes);
        a.html(filename);
        li.append(a);
        $(config.selectors.tab_container_id).append(li);
        if (on_click) {
            a.on('click', function(event) {
                event.preventDefault();
                on_click();
            });
        } else
            a.tab("show");
    },
    /**
     * Removes a tab from the editor.
     * @param {string} filename the complete file name
     */
    remove_tab: function(filename) {
        let basename = get_basename(filename);
        let tab_id = basename+"-tab";
        $("#"+tab_id).parent().remove();
        $("#"+basename).remove();
    },
    /**
     * Generates the content of a tab in the editor.
     * @see {@link https://ace.c9.io|Ace Editor}
     * @param {string} filename the complete file name
     * @param {string} type the file mimetype
     * @param {string} content the file content
     * @returns {jQuery} the element representing the editor
     */
    add_content: function(filename, type, content) {
        let basename = get_basename(filename);
        let div_attributes = {
            "class": "tab-pane fade", 
            "role": "tabpanel",
            "id": basename, 
            "aria-labelledby": basename+"-tab",
            "position": "relative"
        };
        let editor_id = "editor_" + basename;
        let div = $("<div />").attr(div_attributes);
        let div2 = $("<div />").attr({"id": editor_id, "class": "ace_editor"});
        div.append(div2);
        $(config.selectors.tab_content_container_id).append(div);

        let editor = ace.edit(editor_id);
        let language = utilities.identify_language(type);
        editor.session.setMode("ace/mode/"+language);
        editor.$blockScrolling = Infinity;
        editor.setOptions({
            enableBasicAutocompletion: true,
            //enableSnippets: true,
            enableLiveAutocompletion: false
        });
        if (filename == config.req_file.name)
            editor.setReadOnly(true);
        editor.setValue(content, 1);
        return editor;
    },
    /**
     * Generates a new full tab of the code editor.
     * @param {string} filename the complete file name
     * @param {string} type the file mimetype
     * @param {string} content the file content
     * @returns {jQuery} the element representing the editor
     */
    add_element: function(filename, type, content) {
        let editor = this.add_content(filename, type, content);
        this.add_tab(filename);
        return editor;
    },
    /**
     * Setups the modal for creating a new empty file.
     */
    setup_newfile_modal: function() {
        let body = modal.setup(config.selectors.add_file_modal, "Add Empty File", settings.help.add_file, null, false);
        let form = forms.get_form(config.selectors.add_file_form, true);
        let input = forms.get_input.text(config.selectors.add_file_name, "File Name", true);
        let submit = forms.get_button.submit(config.selectors.add_file_form + "_button", "Add");
        form.append(input);
        form.append(submit);
        body.append(form);
    },
};

/**
 * @namespace
 */
var uploader = {
    /**
     * Adds a new uploaded file to the list, with the corresponding edit and remove buttons.
     * @param {string} filename the complete file name
     * @param {jQuery} edit_button the remove button element
     * @param {jQuery} remove_button the edit button element
     */
    add_item: function(filename, edit_button, remove_button) {
        let basename = get_basename(filename);
        let tr = $("<tr />").attr("id", "uploaded_"+basename+"_container");
        let td_name = $("<td />").attr("id", "uploaded_"+basename).html(filename);
        let td_action1 = $("<td />");
        if (edit_button)
            td_action1.append(edit_button);
        let td_action2 = $("<td />").append(remove_button);
        tr.append(td_name);
        tr.append(td_action1);
        tr.append(td_action2);
        $(config.selectors.uploaded_list_id).append(tr);
    },
    /**
     * Removes an uploaded file from the list.
     * @param {string} filename the complete file name
     */
    remove_item: function(filename) {
        let basename = get_basename(filename);
        $("#uploaded_"+basename+"_container").remove();
    },
    /**
     * Sets a file as in editing (adding a proper class) and removes the corresponding editing button.
     * @param {string} filename the complete file name
     * @param {jQuery} edit_button the edit button element
     */
    set_editing: function(filename, edit_button) {
        let basename = get_basename(filename);
        $("#uploaded_"+basename).addClass(config.vars.uploaded_editing_class);
        edit_button.remove();
    },
    /**
     * Updates the lenght of uploaded items and, if one or more, 
     * shows the button to display the full list.
     * @param {object} items the uploaded items list
     */
    update_length: function(items) {
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
    },
    /**
     * Removes all uploaded files from the list.
     */
    empty: function() {
        $(config.selectors.uploaded_list_id).empty();
    },
    /**
     * Generates the upload form.
     * @param {string} id the form id
     * @param {string} input_id the file input id
     * @param {string} title the form title
     * @param {boolean} multi true if the user can upload multiple files at once
     * @returns {jQuery} the form element
     */
    get_upload_form: function(id, input_id, title, multi) {
        let form = forms.get_form(id, true);
        let input = forms.get_input.file(input_id, "Select File", true, multi);
        let submit = forms.get_button.submit(id + "_button", title);
        form.append(input);
        form.append(submit);
        return form;
    },
    /**
     * Setups the file/package upload modal.
     * It is only one modal with two different forms, one of each is hidden depending on context.
     */
    setup_upload_modal: function() {
        let body = modal.setup(config.selectors.uploads_modal, "Upload", null);
        let form_file = uploader.get_upload_form(config.selectors.upload_form, config.selectors.upload_input, "Upload File", true);
        let form_package = uploader.get_upload_form(config.selectors.upload_package_form, config.selectors.upload_package_input, "Upload Package", false);
        body.append(form_file);
        body.append(form_package);
    },
    /**
     * Hides the upload modal.
     */
    hide_modal: function() {
        $(config.selectors.uploads_modal).modal("hide");
    },
};

/**
 * @namespace
 */
var requirements = {
    /**
     * Adds a new requirement to the list.
     * @param {string} name the library name
     * @param {string} version the selected library version
     * @param {jQuery} versions_button the versions button element
     * @param {jQuery} remove_button the remove button element
     */
    add_item: function(name, version, versions_button, remove_button) {
        let tr = $("<tr />").attr("id", "req_"+name);
        let versions_id = name + "_ver_list";
        let last_version = $("<span />").attr("id", versions_id)
        let last_version_txt = $("<span />").attr("id", versions_id+"_txt").html(version);
        let last_version_input = $("<input />").attr({"type": "hidden", "id": versions_id+"_selected", "value": version});
        last_version.append(last_version_txt);
        last_version.append(last_version_input);
        let td_name = $("<td />").html(name);
        let td_version = $("<td />").append(last_version);
        let td_action1 = $("<td />").append(versions_button);
        let td_action2 = $("<td />").append(remove_button);
        tr.append(td_name);
        tr.append(td_version);
        tr.append(td_action1);
        tr.append(td_action2);
        $(config.selectors.req_container_id).append(tr);
    },
    /**
     * Removes an existing requirement from the list
     * @param {string} name the library name
     */
    remove_item: function(name) {
        $("#req_"+name).remove();
    },
    /**
     * Updates the lenght of selected requirements and, if one or more, 
     * shows the button to display the full list.
     * @param {object} items the requirements list
     */
    update_length: function(items) {
        let keys = Object.keys(items);
        let len = keys.length;
        $(config.selectors.req_list_len).html(len);
        if (len == 0)
            $(config.selectors.req_show_list).hide();
        else
            $(config.selectors.req_show_list).show();
    },
    /**
     * Shows the add requirement modal.
     */
    show_modal: function() {
        modal.show(config.selectors.req_modal_id);
    },
    /**
     * Empties the add requirement modal.
     */
    empty_modal_container: function() {
        $(config.selectors.req_search_results_id).empty();
    },
    /**
     * Adds a new line to the requirements search modal.
     * @param {string} name the library name
     * @param {string} version the library last version
     * @param {array} action_buttons an array of jQuery elements representing actions available on the line
     */
    add_modal_item: function(name, version, action_buttons) {
        let versions_id = name + "_ver";
        let tr = $("<tr />");
        let last_version = $("<span />").attr("id", versions_id).html(version);
        let last_version_input = $("<input />").attr({"type": "hidden", "id": versions_id+"_selected", "value": version});
        last_version.append(last_version_input);
        let td_name = $("<td />").html(name);
        let td_version = $("<td />").append(last_version);
        let td_actions = $("<td />")
        $.each(action_buttons, function(idx, action_button){
            td_actions.append(action_buttons);
        });
        tr.append(td_name);
        tr.append(td_version);
        tr.append(td_actions);
        $(config.selectors.req_search_results_id).append(tr);
    },
    /**
     * Replaces the displayed version of a library with the list of all available versions.
     * Pre-selects the last version (or any specified version).
     * @param {string} name the library name
     * @param {array} versions the complete list of available versions
     * @param {string} last_version the last library version (it will be automatically selected)
     * @param {boolean} in_list true if the library is already in the requirements list
     * @param {function(string)} callback a function called when a new version is selected 
     */
    replace_versions: function(name, versions, last_version, in_list, callback) {
        let versions_id = name + "_ver";
        if (in_list)
            versions_id = versions_id + "_list";
        var select_name = versions_id + "_selected";
        var version_select = $("<select />").attr({"name": select_name, "id": select_name});
        $.each(versions, function(idx, ver) {
            let option = $("<option />").html(ver);
            if (ver == last_version)
                option.attr("selected", "selected");
            version_select.append(option);
        });
        $("#"+versions_id).empty();
        $("#"+versions_id).append(version_select);
        if (callback) {
            $(version_select).change(function() {
                callback($(this).val());
            });
        }
    },
    /**
     * Replaces the newly selected version to the requirements list.
     * @param {string} name the library name
     * @param {string} version the selected library version
     */
    replace_selected_version: function(name, version) {
        let versions_id = name + "_ver_list";
        var select_name = versions_id + "_selected";
        $("#"+versions_id+"_txt").html(version);
        $("#"+select_name).val(version);
    },
    /**
     * Replaces the requirements.txt file preview.
     * @param {array} lines list of lines that will compose the file
     */
    preview: function(lines) {
        $("#"+config.selectors.req_preview_div).html(lines.join("<br>"));
    },
    /**
     * Setups the add requirement modal.
     */
    setup_search_modal: function() {
        let body = modal.setup(config.selectors.req_modal_id, "Search Python Dependencies", settings.help.requirements, null, true);
        let form = forms.get_form(config.selectors.req_add_form, true);
        let input = forms.get_input.text(config.selectors.req_title, "Package Name", true);
        let submit = forms.get_button.submit(config.selectors.req_add_form + "_button", "Search");
        let table = $("<submit />").attr({"id": "requirements_search_results"});
        form.append(input);
        form.append(submit);
        body.append(form);
        body.append(table);
    },
    /**
     * Setups the requirements.txt preview modal.
     */
    setup_view_modal: function() {
        let body = modal.setup(config.selectors.req_preview_modal, "requirements.txt", null);
        let div = $("<div />").attr({"id": config.selectors.req_preview_div});
        body.append(div);
    }
};

/**
 * @namespace
 */
var packager = {
    /**
     * Setups the package export modal.
     */
    setup_export_modal: function() {
        let body = modal.setup(config.selectors.export_modal, "Export", settings.help.package_export, null, false);
        let form = forms.get_form(config.selectors.export_form, true);
        let input = forms.get_input.text(config.selectors.export_name, "Analyser Name", true);
        let submit = forms.get_button.submit(config.selectors.export_form + "_button", "Export");
        form.append(input);
        form.append(submit);
        body.append(form);
    },
    /**
     * Setpus the suggestions modal.
     * @param {array} suggestions the suggestions to be shown
     */
    setup_suggestions_modal: function(suggestions) {
        let body = modal.setup(config.selectors.suggestions_modal, "Available Methods", settings.help.suggestions, null, true);
        let div = $("<ul />").attr({"id": config.selectors.suggestions_div});
        $.each(suggestions, function(idx, item) {
            let txt = "<b>" + item.name + "(" + item.args.join() + ")</b>";
            if (item.comment != "")
                txt = txt + "<br><small>" + item.comment + "</small>";
            let li = $("<li />").html(txt);
            div.append(li);
        });
        body.append(div);
        $('[data-toggle="popover"]').popover({trigger: "hover"});
    }
}

export {
    show_error,
    get_text_button,
    get_button,
    editor,
    requirements,
    uploader,
    packager
};
