/**
 * Manage view module.
 * @module manage/view
 */

import * as config from './config'
import * as modal from '../common/modals'
import * as vutils from '../common/viewutils'
import * as forms from '../common/forms'
import * as settings from '../common/settings'

/**
 * Made to be used by the sort function, compares two services based on their name.
 * Usage example: services.sort(service_compare)
 * @param {Object} a an object with a name field
 * @param {Object} b an object with a name field
 * @returns {number} depends on alphabetical order of the two names
 */
function service_compare(a, b){
    return (a.name).localeCompare(b.name);
}

/**
 * Shows a general error message.
 * @param {string} msg the error message
 */
var show_error = function(msg) {
    vutils.show_error(msg, config.vars.step_id);
}

/**
 * @namespace
 */
var status = {
    /**
     * Creates the service display and setups actions on each of them.
     * @param {Array} services an array of objects rappresenting each service attributes
     * @param {function(string)} start function called when the start button is pressed for a specific service
     * @param {function(string)} stop function called when the stop button is pressed for a specific service
     * @param {function(string)} logs function called when the log button is pressed for a specific service
     */
    setup_icons: function(services, start, stop, logs) {
        let container = $(config.selectors.status_icons);
        container.empty();
        let all_running = true;
        let all_stopped = true;
        let scalable_running = false;
        // Orders services alphabetically, for coherence in visualization
        services.sort(service_compare);
        $.each(services, function(idx, item) {
            if (item.name == "scanner")
                $("#"+config.selectors.scale_amount).val(item.num);
            let div = $("<div />").attr("class", "service_container");
            let display = $("<div />").attr("class", "service_display rounded");
            let details = $("<div />").attr("class", "service_details");
            let name = $("<div />").attr("class", "service_name").html(item.name);
            let icon_play = $("<i />").attr({
                "class": "fas fa-play service_start",
                "data-toggle": "tooltip",
                "data-placement": "bottom",
                "title": "Start Service",
            });
            let icon_stop = $("<i />").attr({
                "class": "fas fa-stop service_stop",
                "data-toggle": "tooltip",
                "data-placement": "bottom",
                "title": "Stop Service",
            });
            // Checks if all containers are running and determine status accordingly
            let all_cnt_running = true;
            let all_cnt_stopped = true;
            let cnt_box_container = $("<div />").attr({"class": "service_instance_box_container"});
            $.each(item.containers, function(i, cnt) {
                let cnt_box = $("<div />").attr({"class": "service_instance_box"});
                if (cnt.is_running) {
                    all_cnt_stopped = false;
                    cnt_box.addClass("instance_up");
                    if (item.name == "scanner")
                        scalable_running = true;
                } else {
                    all_cnt_running = false;
                    cnt_box.addClass("instance_down");
                }
                cnt_box_container.append(cnt_box);
            });
            display.append(cnt_box_container);
            if (item.containers.length < 2) {
                display.children(".service_instance_box_container").hide();
            }
            if (all_cnt_running) {
                all_stopped = false;
                div.addClass("service_up");
                display.addClass("btn btn-outline-success");
            } else if (all_cnt_stopped) {
                all_running = false;
                div.addClass("service_down");
                display.addClass("btn btn-outline-danger");
            } else {
                display.addClass("btn btn-outline-warning");
            }
            let icon_info = $("<i />").attr({
                "class": "fas fa-info service_info",
                "data-toggle": "tooltip",
                "data-placement": "bottom",
                "title": "Details",
            });
            icon_info.click(function() {
                status.show_status_details(item);
            })
            let icon_logs = $("<i />").attr({
                "class": "fas fa-bars service_info",
                "data-toggle": "tooltip",
                "data-placement": "bottom",
                "title": "Log",
            });
            icon_logs.click(function() {
                logs(item.name);
            });
            icon_play.click(function() {
                start(item.name);
            });
            icon_stop.click(function() {
                stop(item.name);
            });
            details.append(icon_info);
            details.append(icon_logs);
            details.append(icon_play);
            details.append(icon_stop);
            display.append(name);
            div.append(display);
            div.append(details);
            container.append(div);
            // If all are running, there's no point in using the start button
            if (all_running)
                $("#manage_start").addClass("disabled");
            else
                $("#manage_start").removeClass("disabled");
            // If all are stopped, there's no point in using the stop button
            if (all_stopped) {
                $("#manage_stop").addClass("disabled");
                $("#manage_scale").addClass("disabled");
            } else {
                $("#manage_stop").removeClass("disabled");
                $("#manage_scale").removeClass("disabled");
            }
            // The scale button should be available only if the scanner is running
            if (scalable_running)
                $("#manage_scale").removeClass("disabled");
            else 
                $("#manage_scale").addClass("disabled");
        });
        $(config.selectors.status_icons + ' [data-toggle="tooltip"]').tooltip();
    },
    /**
     * Shows the details modal for the reqeusted service.
     * @param {string} service the requested service
     */
    show_status_details: function(service) {
        $("#"+config.selectors.service_detail_div).empty();
        $("#"+config.selectors.service_detail_div).append(vutils.display_object(service, 0));
        modal.show(config.selectors.service_detail_modal);
    },
    /**
     * Shows the logs modal including the last log text for the reqeusted service.
     * @param {string} txt the full log text
     */
    show_logs: function(txt) {
        txt = txt.replace(/\n/g, "<br />");
        $("#"+config.selectors.service_logs_div).html(txt);
        modal.show(config.selectors.service_logs_modal);
    },
    /**
     * Setups the service detail modal.
     */
    setup_service_modal: function() {
        let body = modal.setup(config.selectors.service_detail_modal, "Service Details", null, null, true);
        let div = $("<div />").attr({"id": config.selectors.service_detail_div});
        body.append(div);
    },
    /**
     * Setups the logs modal.
     */
    setup_logs_modal: function() {
        let body = modal.setup(config.selectors.service_logs_modal, "Service Log", null, null, true);
        let div = $("<div />").attr({"id": config.selectors.service_logs_div});
        body.append(div);
    }
}

/**
 * @namespace
 */
var manage = {
    /**
     * Setups the modal with the service scale form.
     */
    setup_scale_modal: function() {
        let body = modal.setup(config.selectors.scale_modal, "Scale Scanners", settings.help.scale_scanner, null, false);
        let form = forms.get_form(config.selectors.scale_form, true);
        let input = forms.get_input.text(config.selectors.scale_amount, "Number of Scanners", true);
        input.val(config.vars.scale_default);
        let submit = forms.get_button.submit(config.selectors.scale_form + "_button", "Scale");
        form.append(input);
        form.append(submit);
        body.append(form);
    },
    /**
     * Updates the total number of analysed images.
     * @param {number} num the total number of images
     */
    show_total: function(num) {
        $(config.selectors.num_images_id).html(num);
    },
    /**
     * Shows the date and time when the page was last refreshed, in the local time style.
     */
    show_refresh_time: function() {
        var d = new Date();
        $(config.selectors.timestamp_id).html(d.toLocaleString());
    },
}

export {
    show_error,
    status,
    manage
}