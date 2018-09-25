/**
 * Modals module.
 * Functions for setup and handling of modals.
 * @module common/modals
 */

import * as vutils from './viewutils'

/**
 * Creates a new modal.
 * It will be appended to the body and hidden, ready to be used.
 * @see {@link https://getbootstrap.com/docs/4.1/components/modal/}
 * @param {string} id the modal id
 * @param {string} title the modal title
 * @param {string} help the modal help text
 * @param {jQuery} footer_buttons buttons to be shown in the modal footer
 * @param {boolean} large true if the modal should be large
 */
var setup = function(id, title, help, footer_buttons, large) {
    if (id[0] == "#")
        id = id.slice(1);
    let label_id = id + "_title";
    let cnt = $("<div />").attr({
        "class": "modal fade",
        "id": id, 
        "tabindex": "-1",
        "role": "dialog",
        "aria-labelledby": label_id,
        "aria-hidden": "true"
    });
    let dialog = $("<div />").attr({
        "class": "modal-dialog",
        "role": "document"
    });
    if (large)
        dialog.addClass("modal-lg");
    let content = $("<div />").attr({"class": "modal-content"});
    let header = $("<div />").attr({"class": "modal-header"});
    let h5 = $("<h5 />").attr({
        "class": "modal-title",
        "id": label_id
    }).html(title);

    if (help) {
        let help_icon = vutils.get_help_icon(help);
        h5.append(help_icon);
    }
    let close = vutils.get_close_button("modal");
    let body = $("<div />").attr({"class": "modal-body"});
    let error = $("<div />").attr({"class": "error-container"});
    body.append(error);

    cnt.append(dialog);
    dialog.append(content);
    header.append(h5);
    header.append(close);
    content.append(header);
    content.append(body);
    if (footer_buttons) {
        let footer = $("<div />").attr({"class": "modal-footer"});
        footer.append(footer_buttons);
        content.append(footer);
    }
    $("body").append(cnt);
    return body;
};

/**
 * Returns the body element of a specific modal.
 * @param {string} id the modal id (including #) or other selector
 * @returns {object} the element corresponting to the the object body
 */
var get_body = function(id) {
    return $(id + " .modal-body");
};

/**
 * Shows a specific modal.
 * @param {string} id the modal id (including #) or other selector
 */
var show = function(id) {
    clear_errors(id);
    clear_forms(id);
    $(id).modal("show");
};

/**
 * Hides a specific modal.
 * @param {string} id the modal id (including #) or other selector
 */
var hide = function(id) {
    $(id).modal("hide");
};

/**
 * Shows an error message in a specific modal.
 * @param {string} id the modal id (including #) or other selector
 * @param {string} msg the error message
 */
var error = function(id, msg) {
    let error = vutils.generate_message("danger", msg);
    clear_errors(id);
    $(id + " .error-container").append(error);
};

/**
 * Removes all error messages from a specific modal.
 * @param {string} id the modal id (including #) or other selector
 */
var clear_errors = function(id) {
    $(id + " .error-container").empty();
};

/**
 * Removes all previous user input in forms.
 * @param {string} id the modal id (including #) or other selector
 */
var clear_forms = function(id) {
    let forms = $(id + " .modal-body form");
    $.each(forms, function(idx, form) {
        form.reset();
    });
};

export {
    setup,
    get_body,
    show,
    hide,
    error,
    clear_errors
}