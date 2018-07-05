
var vars = {
    step: 3,
    step_id: "visual",
    action_btn_class: "btn btn-sm action_button",
    uploaded_editing_class: "uploaded_editing",
    base_zip_name: "deploy-package-",
    page_size: 20,
    max_chart_groups: 10,
    not_acceped_fields: [null, undefined, "undefined", "null", "array", "date_string"],
};

var selectors = {
    endpoint_modal_id: "#endpoint_modal",
    endpoint_url_input: "#endpoint_url",
    endpoint_form: "#set_endpoint_form",
    results_container: "#results_container",
    results_not_ready: "#results_not_ready",
    results_list: "results_list",
    results_list_id: "#results_list",
    num_images_id: "#num_images",
    endpoint_set_button: "#set_endpoint",
    custom_search_form: "#custom_search",
    custom_search_form_select: "#custom_search_select",
    custom_search_form_subfield: "#custom_search_subfield",
    custom_search_form_free: "#custom_search_free",
    custom_search_form_free_input: "#add_custom_input",
    results_search_form: "#results_search",
    add_chart_form: "#add_chart",
    export_menu: ".export-dropdown-menu",
    error_container: ".error-container",
    confirm_modal_id: "#confirm_modal",
    confirm_msg_id: "#confirm_msg",
    confirm_button_id: "#confirm_button",
    sample_image_modal: "#sample_image_modal",
    sample_image_div: "sample_image_container",
    reload_button: "#reload",
};

var graphs = {
    attributes: {
        label: "Attribute",
        options: [],
    },
    types: {
        label: "Type",
        options: [
            {value: "bar", label: "Bar"}, 
            {value: "horizontalBar", label: "Horizontal Bar"}, 
            {value: "pie", label: "Pie"}, 
            {value: "doughnut", label: "Doughnut"}, 
        ]
    }, 
    approx: {
        label: "Approximation",
        options: [
            {value: "ranges", label: "Ranges"}, 
            {value: "others", label: "Others"}, 
        ]
    }
}

export {
    vars,
    selectors,
    graphs
}