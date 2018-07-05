import * as vutils from './viewutils'

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

var get_body = function(id) {
    return $(id + " .modal-body");
};

var show = function(id) {
    $(id).modal("show");
};

var hide = function(id) {
    $(id).modal("hide");
};

var error = function(id, msg) {
    let error = vutils.generate_message("danger", msg);
    clear_errors(id);
    $(id + " .error-container").append(error);
};

var clear_errors = function(id) {
    $(id + " .error-container").empty();
};


export {
    setup,
    get_body,
    show,
    hide,
    error,
    clear_errors
}