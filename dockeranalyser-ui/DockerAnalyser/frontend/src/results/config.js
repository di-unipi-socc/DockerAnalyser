/**
 * Results configuration constants.
 * @module results/config
 */

 /**
 * Misc variables.
 * @type {Object}
 * @property {number} step the numeric id of this secion
 * @property {string} step_id the text id of this secion
 * @property {number} max_chart_groups the maximum number of different values in each chart
 * @property {Array} not_acceped_fields type of attributes not accepted as searchable
 * @property {string} search_form_cnt_id id for the search form section
 * @property {string} search_form_label title of the search form secion
 */
var vars = {
    step: 3,
    step_id: "visual",
    max_chart_groups: 10,
    not_acceped_fields: [null, undefined, "undefined", "null", "array", "date_string"],
    search_form_cnt_id: "results_search_container", 
    search_form_label: "Image Search",
};

/**
 * Misc CSS selectors (ids, classes).
 * @type {Object} 
 */
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
    chart_attributes_select: "#select_attributes",
    graph_container: "#graph_container",
    export_menu: ".export-dropdown-menu",
    error_container: ".error-container",
    confirm_modal_id: "#confirm_modal",
    confirm_msg_id: "#confirm_msg",
    confirm_button_id: "#confirm_button",
    sample_image_modal: "#sample_image_modal",
    sample_image_div: "sample_image_container",
    reload_button: "#reload",
    pagination_container: "pagination_container"
};

/**
 * Used to generate dinamically the "new chart" form.
 * @type {Object} 
 */
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