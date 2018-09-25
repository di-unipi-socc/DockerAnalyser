/**
 * Forms module.
 * Handles general form generation (e.g. in modals).
 * @module common/forms
 */

 /**
 * Generates a new form.
 * @param {string} id the form id
 * @param {boolean} inline true if the form should be displayed on a single line
 * @returns {jQuery} the new form element
 */
var get_form = function(id, inline) {
    let form = $("<form />").attr({"name": id, "id": id});
    if (inline)
        form.addClass("form-inline");
    return form;
};

/**
 * Generates a new fieldset.
 * @param {string} label the label to be used as legend in the new fieldset (optional)
 * @returns {jQuery} the new fieldset element
 */
var get_fieldset = function(label) {
    let fieldset = $("<fieldset />");
    if (label) {
        let legend = $("<legend />").html(label);
        fieldset.append(legend);
    }
    return fieldset;
};

/**
 * @namespace
 */
var get_input = {
    /**
     * Generates a new text input.
     * @param {string} id the input id
     * @param {string} placeholder the input placeholder
     * @param {boolean} required true if the field should be mandatory
     * @param {string} value the default value
     * @returns {jQuery} the new input element
     */
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
    /**
     * Generates a new file input.
     * @param {string} id the input id
     * @param {string} placeholder the input placeholder
     * @param {boolean} required true if the field should be mandatory
     * @param {boolean} multi true if the user should be able to select multiple files at once
     * @returns {jQuery} the new input element
     */
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
    /**
     * Generates a new (empty) select element.
     * @param {string} id the select id
     * @returns {jQuery} the new select element
     */
    get_select: function(id) {
        return $("<select />").attr({"class": "custom-select", "name": id, "id": id});
    },
}

/**
 * @namespace
 */
var get_button = {
    /**
     * Generates a new submit input, styled as a button.
     * @param {string} id the button id
     * @param {string} value the text displayed on the button
     * @returns {jQuery} the new button element
     */
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
