var get_form = function(id, inline) {
    let form = $("<form />").attr({"name": id, "id": id});
    if (inline)
        form.addClass("form-inline");
    return form;
};

var get_fieldset = function(label) {
    let fieldset = $("<fieldset />");
    if (label) {
        let legend = $("<legend />").html(label);
        fieldset.append(legend);
    }
    return fieldset;
};

var get_input = {
    text: function(id, placeholder, required, value) {
        let input = $("<input />").attr({
            "type": "text", 
            "name": id, 
            "id": id, 
            "placeholder": placeholder,
            "class": "form-control"
        });
        if (required)
            input.attr({"required": "required"});
        if (value)
            input.val(value);
        return input;
    },
    file: function(id, placeholder, required, multi) {
        /* <div class="custom-file">
        <input type="file" class="custom-file-input" id="customFile">
        <label class="custom-file-label" for="customFile">Choose file</label>
        </div> */

        let input = $("<input />").attr({
            "type": "file", 
            "id": id,
            "name": id,
            "placeholder": placeholder,
            "class": "form-control"
        });
        if (required)
            input.attr({"required": "required"});
        if (multi)
            input.attr({"multiple": "multiple"});
        return input;
    },
    get_select: function(id) {
        return $("<select />").attr({"class": "custom-select", "name": id, "id": id});
    },
}

var get_button = {
    submit: function(id, value) {
        return $("<input />").attr({
            "type": "submit", 
            "class": "btn btn-info", 
            "name": id,
            "id": id,
            "value": value
        });
    }
}

export {
    get_form,
    get_fieldset,
    get_input,
    get_button,
}
