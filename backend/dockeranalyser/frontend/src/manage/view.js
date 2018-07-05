import * as config from './config'
import * as modal from '../common/modals'
import * as vutils from '../common/viewutils'
import * as forms from '../common/forms'
import * as settings from '../common/settings'

var show_error = function(msg) {
    vutils.show_error(msg, config.vars.step_id);
}

var status = {
    setup_icons: function(services, start, stop, logs) {
        let container = $(config.selectors.status_icons);
        container.empty();
        let all_started = true;
        let all_stopped = true;
        $.each(services, function(idx, item) {
            if (item.name == "scanner")
                $("#"+config.selectors.scale_amount).val(item.num);
            let div = $("<div />").attr("class", "service_container");
            let display = $("<div />").attr("class", "service_display rounded");
            let details = $("<div />").attr("class", "service_details");
            let name = $("<div />").attr("class", "service_name").html(item.name);
            let action = $("<div />").attr("class", "service_action");
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
            if (item.containers[0].is_running) {
                all_stopped = false;
                div.addClass("service_up");
                display.addClass("btn btn-outline-success");
            } else {
                all_started = false;
                div.addClass("service_down");
                display.addClass("btn btn-outline-danger");
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
            //display.append(action);
            //details.append(icon_info);
            div.append(display);
            div.append(details);
            container.append(div);
            // If all are running, there's no point in using the start button
            if (all_started)
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
        });
        $(config.selectors.status_icons + ' [data-toggle="tooltip"]').tooltip();
    },
    show_status_details: function(service) {
        $("#"+config.selectors.service_detail_div).empty();
        $("#"+config.selectors.service_detail_div).append(vutils.display_object(service, 0));
        modal.show(config.selectors.service_detail_modal);
    },
    show_logs: function(txt) {
        txt = txt.replace(/\n/g, "<br />");
        $("#"+config.selectors.service_logs_div).html(txt);
        modal.show(config.selectors.service_logs_modal);
    },
    setup_service_modal: function() {
        let body = modal.setup(config.selectors.service_detail_modal, "Service Details", null, null, true);
        let div = $("<div />").attr({"id": config.selectors.service_detail_div});
        body.append(div);
    },
    setup_logs_modal: function() {
        let body = modal.setup(config.selectors.service_logs_modal, "Service Log", null, null, true);
        let div = $("<div />").attr({"id": config.selectors.service_logs_div});
        body.append(div);
    }
}

var manage = {
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
    show_total: function(num) {
        $(config.selectors.num_images_id).html(num);
        var d = new Date();
        $(config.selectors.timestamp_id).html(d.toLocaleString());
    },
}

export {
    show_error,
    status,
    manage
}