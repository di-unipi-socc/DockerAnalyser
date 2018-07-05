var mimetype = require('mimetype');

var analysis_content = "def analysis(image_json, context):\n    logger = context['logger']\n    client_images = context['images']\n    logger.info('Received image from rabbitMQ: {}'.format(image_json))\n    client_images.post_image(image_json)\n    return True"

var vars = {
    step: 0,
    step_id: "edit",
    action_btn_class: "btn btn-sm action_button",
    uploaded_editing_class: "uploaded_editing",
    base_zip_name: "deploy-package-",
}

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
    docker_build_button: "#docker_compose_build",
    docker_up_button: "#package_up"
};

var req_file = {
    name: "requirements.txt",
    type: "text/plain"
};

var analysis_file = {
    name: "analysis.py",
    type: "text/x-python-script",
    content: analysis_content
};

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

mimetype.set(".py", "text/x-python-script");
mimetype.set(".md", "text/markdown"); 

export {
    vars,
    selectors,
    req_file,
    analysis_file,
    languages
}