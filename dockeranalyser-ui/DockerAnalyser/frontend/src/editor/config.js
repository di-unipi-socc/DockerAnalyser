/**
 * Editor configuration constants.
 * @module editor/config
 */

var mimetype = require('mimetype');

/**
 * This is used only as a backup if server is unavailable
 * @type {string} 
 */
var analysis_content = "def analysis(image_json, context):\n    logger = context['logger']\n    client_images = context['images']\n    logger.info('Received image from rabbitMQ: {}'.format(image_json))\n    client_images.post_image(image_json)\n    return True"

/**
 * Misc variables.
 * @type {Object}
 * @property {number} step the numeric id of this secion
 * @property {string} step_id the text id of this secion
 * @property {string} action_btn_class default class for the action button
 * @property {string} uploaded_editing_class class added to an uploaded file open in the editor
 * @property {string} base_zip_name base name for the downloadable .zip package
 */
var vars = {
    step: 0,
    step_id: "edit",
    action_btn_class: "btn btn-sm action_button",
    uploaded_editing_class: "uploaded_editing",
    base_zip_name: "deploy-package-",
}

/**
 * Misc CSS selectors (ids, classes).
 * @type {Object} 
 */
var selectors = {
    tab_container_id: "#file_list_tabs",
    tab_content_container_id: "#file_list_tabs_content",
    add_file_modal: "#add_file_modal",
    add_file_form: "add_file_form",
    add_file_name: "add_file_name",
    add_file_type: "add_file_type",
    uploaded_list_id: "#uploaded_list",
    upload_form: "upload_file_form",
    upload_input: "upload_files",
    upload_package_form: "upload_package_form",
    upload_package_input: "upload_package",
    uploaded_show_list: "#upload_edit",
    uploaded_list_len: "#uploads_length",
    uploads_modal: "#uploads_modal",
    req_add_form: "add_requirement_form",
    req_title: "requirement_title",
    req_container_id: "#requirements_list",
    req_search_results_id: "#requirements_search_results",
    req_modal_id: "#requirements_modal",
    req_show_list: "#requirements_edit",
    req_list_len: "#requirements_length",
    req_preview_div: "requirements_view",
    req_preview_modal: "#requirements_preview_modal",
    export_modal: "#export_modal",
    export_name: "export_title",
    export_form: "export_form",
    error_container: ".error-container",
    confirm_modal_id: "#confirm_modal",
    confirm_msg_id: "#confirm_msg",
    confirm_button_id: "#confirm_button",
    suggestions_modal: "#suggestions_modal",
    suggestions_div: "#available_methods"
};

/**
 * Attributes of the requirements file.
 * @type {Object}
 * @property {string} name name of the file
 * @property {string} type mimetype of the file
 */
var req_file = {
    name: "requirements.txt",
    type: "text/plain"
};

/**
 * Attributes of the analysis file.
 * @type {Object}
 * @property {string} name name of the file
 * @property {string} type mimetype of the file
 * @property {string} content file default content
 */
var analysis_file = {
    name: "analysis.py",
    type: "text/x-python-script",
    content: analysis_content
};

/**
 * Supported languages
 * @type {Object}
 */
var languages = {
    "text/plain": {name: "Plain Text", value: "plain_text"},
    "text/x-python": {name: "Python", value: "python"},
    "text/x-python-script": {name: "Python", value: "python"},
    "text/html": {name: "HTML", value: "html"},
    "text/css": {name: "CSS", value: "css"},
    "text/markdown": {name: "Markdown", value: "markdown"},
    "application/x-javascript": {name: "Javascript", value: "javascript"},
    "application/json": {name: "JSON", value: "javascript"},
    "application/x-sh": {name: "Shell Script", value: "sh"}
};

// Languages not already included in the mimetype recognition module
mimetype.set(".py", "text/x-python-script");
mimetype.set(".md", "text/markdown"); 

export {
    vars,
    selectors,
    req_file,
    analysis_file,
    languages
}