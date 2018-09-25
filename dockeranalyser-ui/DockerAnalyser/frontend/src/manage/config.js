/**
 * Manage configuration constants.
 * @module manage/config
 */

 /**
 * Misc variables.
 * @type {Object}
 * @property {number} step the numeric id of this secion
 * @property {string} step_id the text id of this secion
 * @property {number} scale_default the default number of instances shown in the scale form
 * @property {number} reload_timeout after how many seconds the section should reload (not used at the moment)
 */
 var vars = {
    step: 2,
    step_id: "manage",
    scale_default: 1,
    reload_timeout: 10  // seconds
}

/**
 * Misc CSS selectors (ids, classes).
 * @type {Object} 
 */
var selectors = {
    status_icons: "#dashboard_status_icons",
    service_detail_modal: "#service_detail_modal",
    service_detail_div: "service_detail",
    service_logs_modal: "#service_logs_modal",
    service_logs_div: "service_log",
    scale_modal: "#scale_modal",
    scale_form: "scale_form",
    scale_amount: "scale_amount",
    num_images_id: "#num_images_dashboard",
    timestamp_id: "#last_refresh_dashboard",
}

export {
    vars,
    selectors
}