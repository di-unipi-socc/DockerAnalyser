/**
 * View Utils module.
 * Misc view utilities.
 * @module common/viewutils
 */

import * as config from './config'
import * as modal from './modals'

/**
 * Generates a box for a sub-section.
 * @param {string} id the box id
 * @param {string} title the box title
 * @returns {jQuery} the element representing the box
 */
var get_main_box = function(id, title) {
    let div = $("<div />").attr({"id": id, "class": "border rounded results_container_box"});
    if (title) {
        let h3 = $("<h3 />").html(title);
        div.append(h3);
    }
    return div;
};

/**
 * Shows the content of a specific section.
 * @param {string} step_id the step textual id
 */
var show_body = function(step_id) {
    $("#"+step_id+"_body_container").show();
};

/**
 * Hides the content of a specific section.
 * @param {string} step_id the step textual id
 */
var hide_body = function(step_id) {
    $("#"+step_id+"_body_container").hide();
};

/**
 * Generates an alert message. 
 * @see {@link https://getbootstrap.com/docs/4.1/components/alerts/}
 * @param {string} type the messge type (primary, secondary, success, danger, warning, info, light, dark)
 * @param {string} msg the message
 * @returns {jQuery} the element representing the alert message, with the proper style
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

/**
 * Shows a general alert message in a specific section.
 * @param {string} type the message type 
 * @param {string} msg the message
 * @param {string} step_id the step textual id
 */
var show_message = function(type, msg, step_id) {
    let error = generate_message(type, msg);
    let container = $("#step-" + step_id + " .error-container");
    container.empty();
    container.append(error);
}

/**
 * Shows an error message in a specific section.
 * @param {string} msg the error message
 * @param {string} step_id the step textual id
 */
var show_error = function(msg, step_id) {
    show_message("danger", msg, step_id);
}

/**
 * Shows an info message in a specific section.
 * @param {string} msg the error message
 * @param {string} step_id the step textual id
 */
var show_info = function(msg, step_id) {
    show_message("success", msg, step_id);
}

/**
 * Removes all messages from a specific section.
 * @param {string} step_id the step textual id
 */
var clean_messages = function(step_id) {
    $("#step-" + step_id + " .error-container").empty();
}

/**
 * Generates a "close" button that dismisses an element.
 * @param {string} dismiss the id of the element to dismiss
 * @returns {jQuery} the element representing the button
 */
var get_close_button = function(dismiss) {
    let button = $("<button />").attr({"type": "button", "class": "close", "data-dismiss": dismiss, "aria-label": "Close"});
    let icon = $("<span />").attr({"aria-hidden": "true"}).html("&times;");
    button.append(icon);
    return button;
};

/**
 * Generates an help icon with a popover help text.
 * @param {string} txt the help text
 * @returns {jQuery} the element representing the help icon 
 */
var get_help_icon = function(txt) {
    let help_icon = $("<i/>").attr({
        "class": "fas fa-question-circle help_icon",
        "data-toggle": "popover",
        "data-placement": "right", 
        "data-content": txt
    });
    return help_icon;
}

/**
 * Generates a button that, when clicked, performs a specific action 
 * (calls a function or opens a modal).
 * @param {string} basename the section text id
 * @param {Object} values the object representing the action
 * @param {string} values.name the action id
 * @param {string} values.title the action full name (will be shown in a popover)
 * @param {string} values.icon the FontAwesome icon name
 * @param {string} values.style the icon style (info, danger)
 * @param {string} values.modal if the action must open a modal, the modal id
 * @param {function} values.action if the action must call a function
 * @returns {jQuery} the element representing the action button 
 */
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
        button.click(function(){ modal.show(values.modal); });
    if (values.action)
        button.click(function(){ values.action(); });
    return button;
}

/**
 * Given a list of actions, generates the corresponding buttons.
 * @param {string} basename the section text id
 * @param {Array} actions the actions array
 */
var setup_action_buttons = function(basename, actions) {
    var section_selector = "#"+basename+"_actions";
    var container = $(section_selector);
    $.each(actions, function(idx, action) {
        let button = create_action_button(basename, action);
        container.append(button);
    });
}

/**
 * Displays all attributes (and attribute content) of an arbitrary object. 
 * If a field is a nested object, it will be displayed recursively with lv+1 
 * @param {Object} item the object you want to display
 * @param {number} lv the current number of nested levels
 * @returns {jQuery} the element representing the object, inside a div
 */
var display_object = function(item, lv) {
    let cnt = $("<div />");
    $.each(item, function(key, val) {
        // If an attribute starts with an underscore, it is considered privete and will not be shown
        if (key[0] == "_")
            return true;  // continue
        // If a field contains an object, it will be shown recursively
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

/**
 * Fixes the height of a specific section after its content is fully loaded.
 * @param {number} idx the section numeric id
 */
var fix_height = function(idx) {
    let main = $('#smartwizard');
    let nav = main.children('ul');
    let steps = $("li > a", nav);
    let container = $('#smartwizard_container');
    let page = $(steps.eq(idx).attr("href"), main);
    let height = page.outerHeight();
    container.finish().animate({ minHeight: height }, 400, function(){});
}

/**
 * Setups the confirmation modal.
 */
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
 * @param {string} msg the text message
 * @param {function} callback function called if the user confirms
 * @param {Object} values values to be passed to the callback
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
    show_body,
    hide_body,
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