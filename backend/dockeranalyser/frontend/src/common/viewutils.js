import * as config from './config'
import * as modal from './modals'

var get_main_box = function(id, title) {
    let div = $("<div />").attr({"id": id, "class": "border rounded results_container_box"});
    if (title) {
        let h3 = $("<h3 />").html(title);
        div.append(h3);
    }
    return div;
};

/**
 * Shows a general error message.
 * @param {string} msg the error message
 */
var generate_message = function(type, msg) {
    let div = $("<div />").attr({"role": "alert", "class": "alert alert-" + type + " alert-dismissible fade show"});
    let close_button = $("<button />").attr({"type": "button", "class": "close", "data-dismiss": "alert", "aria-label": "Close"});
    let close_icon = $("<span />").attr("aria-hidden", "true").html("&times;");
    close_button.append(close_icon);
    div.append(msg);
    div.append(close_button);
    return div;
};

var show_message = function(type, msg, step_id) {
    let error = generate_message(type, msg);
    let container = $("#step-" + step_id + " .error-container");
    container.empty();
    container.append(error);
}

var show_error = function(msg, step_id) {
    show_message("danger", msg, step_id);
}

var show_info = function(msg, step_id) {
    show_message("success", msg, step_id);
}

var clean_messages = function(step_id) {
    $("#step-" + step_id + " .error-container").empty();
}

var get_close_button = function(dismiss) {
    let button = $("<button />").attr({"type": "button", "class": "close", "data-dismiss": dismiss, "aria-label": "Close"});
    let icon = $("<span />").attr({"aria-hidden": "true"}).html("&times;");
    button.append(icon);
    return button;
};

var get_help_icon = function(txt) {
    let help_icon = $("<i/>").attr({
        "class": "fas fa-question-circle help_icon",
        "data-toggle": "popover",
        "data-placement": "right", 
        "data-content": txt
    });
    return help_icon;
}

var create_action_button = function(basename, values) {
    let button_attributes = {
        "type": "button",
        "class": "btn btn-outline-"+values.style,
        "id": basename+"_"+values.name,
        "data-toggle": "tooltip",
        "data-placement": "bottom",
        "title": values.title,
    }
    let base_class = values.base_class;
    if (!base_class)
        base_class = "fas";  // solid
    let icon = $("<i />").attr("class", base_class + " fa-" + values.icon);
    let button = $("<button />").attr(button_attributes);
    button.append(icon);
    if (values.modal)
        button.click(function(){ $(values.modal).modal("show"); });
    if (values.action)
        button.click(function(){ values.action(); });
    return button;
}

var setup_action_buttons = function(basename, actions) {
    var section_selector = "#"+basename+"_actions";
    var container = $(section_selector);
    $.each(actions, function(idx, action) {
        let button = create_action_button(basename, action);
        container.append(button);
    });
}

var display_object = function(item, lv) {
    let cnt = $("<div />");
    $.each(item, function(key, val) {
        // Non mostriamo i campi che iniziano con un underscore
        if (key[0] == "_")
            return true;  // continue
        // Se il campo contiene un oggetto, lo rappresentiamo ricorsivamente
        let type = $.type(val);
        let has_children = (type == "object" || type == "array");
        if (has_children)
            val = display_object(val, lv+1);
        let k = $("<strong />").html(key + ": ");
        let el = $("<div />");
        for (let i=0; i<lv; i++) {
            let space = $("<div />").attr("class", "space");
            el.append(space);
        }
        el.append(k);
        if (!has_children)
            val = ""+val;
        el.append(val);
        cnt.append(el);
    });
    return cnt;
};

var fix_height = function(idx) {
    let main = $('#smartwizard');
    let nav = main.children('ul');
    let steps = $("li > a", nav);
    let container = $('#smartwizard_container');
    let page = $(steps.eq(idx).attr("href"), main);
    let height = page.outerHeight();
    container.finish().animate({ minHeight: height }, 400, function(){});
}

var setup_confirm_modal = function() {
    let footer = $("<div />");
    let submit = $("<button />").attr({
        "type": "button", 
        "class": "btn btn-info", 
        "id": "confirm_button", 
        "data-dismiss": "modal"
    }).html("Confirm");
    let cancel = $("<button />").attr({
        "type": "button", 
        "class": "btn btn-secondary", 
        "data-dismiss": "modal"
    }).html("Cancel");
    footer.append(submit);
    footer.append(cancel);
    let body = modal.setup(config.selectors.confirm_modal_id, "Confirm", null, footer, false);
    let div = $("<div />").attr({"id": "confirm_msg"});
    body.append(div);
};

/**
 * Shows a confirmation modal with the message provided.
 * If the user confirms, it calls the callback provided with the values provided.
 * @param {string} msg file mime type
 * @param {function} callback file mime type
 * @param {Object} values file mime type
 */
var confirm = function(msg, callback, values) {
    $(config.selectors.confirm_msg_id).html(msg);
    $(config.selectors.confirm_modal_id).modal("show");
    $(config.selectors.confirm_button_id).unbind("click");  // Removing previous bindings
    $(config.selectors.confirm_button_id).click(function() {
        callback(values);
    });
};

export {
    get_main_box,
    generate_message,
    show_message,
    show_error,
    show_info,
    clean_messages,
    get_close_button,
    get_help_icon,
    create_action_button,
    setup_action_buttons, 
    display_object,
    fix_height,
    setup_confirm_modal,
    confirm
}