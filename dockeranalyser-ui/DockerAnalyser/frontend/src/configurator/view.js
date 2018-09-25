/**
 * Configurator view module.
 * @module configurator/view
 */

import * as config from './config'
import * as vutils from '../common/viewutils'

/**
 * Shows a general error message.
 * @param {string} msg the error message
 */
var show_error = function(msg) {
    vutils.show_error(msg, config.vars.step_id);
}

/**
 * Handles the form generation of the configuration section.
 * The configuration form is generated based on the form_fields variable
 * @see configurator/config.form_fields
 * @namespace
 */
var forms = {
    /**
     * Creates a new fieldset for the configuration form, including a legend.
     * If a container selector is provided, the new element will be automatically added to that container.
     * @param {string} label text for the fieldset legend
     * @param {string} container the container selector
     * @returns {jQuery} the jQuery object rapresenting the new fieldset
     */
    add_fieldset: function(label, container) {
        let fieldset = $("<fieldset />").attr({"class": "container"});
        let legend = $("<legend />").html(label);
        fieldset.append(legend);
        if (container)
            $(container).append(fieldset);
        return fieldset;
    },
    /**
     * Generates a new input field for a form (including its label and help text).
     * If a container element is provided, the field will be also added to it.
     * @see configurator/config.form_fields
     * @param {Object} field the object rapresenting the field, as defined in form_fields
     * @param {string} field.name field name, will populate the name attribute
     * @param {string} field.type the field type, will be used to decide the input type (text, checkbox, number, radio)
     * @param {string} field.label label for the field
     * @param {string} field.help help text for the field
     * @param {string} field.placeholder text placeholder for the field
     * @param {Array} field.values pairs of value/label used to populate a radio input
     * @param {jQuery|string} container the container object or the container selector (may be a form, a fieldset, a div)
     * @param {string|number|boolean} default_value the field default value, if available
     * @returns {jQuery} the jQuery object rapresenting the new field
     */
    add_field: function(field, container, default_value) {
        if (!default_value)
            default_value = "";
        let div = $("<div />").attr({"class": "row"});
        let is_checkbox = (field.type == "checkbox");
        let input_class = "col-sm-6";
        let label_class = "col-sm-2";
        let help_class =  "col-sm-4";
        if (is_checkbox) {
            input_class = "col-sm-8";
            label_class = "";
        }
        let input_container = $("<div />").attr({"class": input_class});
        let label = $("<label />").attr({
            "for": field.name,
            "class": is_checkbox ? " form-check-label" : label_class + " colon", 
        });
        label.html(field.label);
        
        if (field.type == "radio") {
            div.append(label);
            $.each(field.values, function(idx, values) {
                let radio_container = $("<div />").attr({"class": "form-check form-check-inline"});
                let id = field.name + idx;
                let input = $("<input />").attr({
                    "type": "radio",
                    "name": field.name,
                    "id": id,
                    "class": "form-check-input", 
                    "value": values.value
                });
                let lbl = $("<label />").attr({
                    "for": id,
                    "class": "form-check-label", 
                }).html(values.label);
                if (values.value == default_value)
                    input.attr("checked", "checked");
                radio_container.append(input);
                radio_container.append(lbl);
                input_container.append(radio_container);
            });
        } else {
            let input = $("<input />").attr({
                "type": field.type,  // text, number, checkbox
                "name": field.name,
                "id": field.name,
                "class": is_checkbox ? "form-check-input" : "form-control form-control-sm", 
                "placeholder": field.placeholder
            });    
            if (is_checkbox) {
                input.attr("value", "t");
                if (default_value == true)
                    input.attr("checked", "checked");
                input_container.addClass("form-check checkbox-row");
                input_container.append(input);
                input_container.append(label);
            } else {
                input.attr("value", default_value);
                input_container.append(input);
                div.append(label);
            }
        }
        let help_container = $("<div />").attr({"class": help_class});
        let help = vutils.get_help_icon(field.help);
        help_container.append(help);
        div.append(input_container);
        div.append(help_container);
        if (container)
            $(container).append(div);
        return div;
    },
    /**
     * Generates a submit button for a form.
     * @param {string} id the button id
     * @param {string} value the button text
     * @param {string} btn_class the button class (primary, secondary, success, danger, warning, info, light, dark)
     * @returns {jQuery} the jQuery object rapresenting the new button
     */
    get_submit_button: function(id, value, btn_class) {
        return $("<input />").attr({"type": "submit", "class": "btn btn-"+btn_class, "value": value, "id": id});
    }
}

/**
 * @namespace
 */
var configurator = {
    /**
     * Given a string rappresenting the last configuration values, parses it to generate
     * an Object containing the same values.
     * @param {string} defaults the string containing the JSON rappresentation of the last configuration values
     * @param {string} service the involved service
     * @returns {Object} an Object containing all form arguments and their value
     */
    get_args: function(defaults, service) {
        defaults = defaults.replace(/None/g, "null");
        defaults = defaults.replace(/'/g, '"');
        defaults = JSON.parse(defaults);
        let command = defaults[service].command;
        let args = {};
        $.each(command, function(idx, arg) {
            let parts = arg.split("=");
            let name = parts[0].replace("--", "")
            let value = true;  // If present, it is set
            if (parts.length > 1) 
                value = parts[1];
            if (value == "True")
                value = true;
            if (value == "False")
                value = false;
            args[name] = value;
        });
        return args;
    },
    /**
     * Setups the whole configuration form, filling it with the last available configutration.
     * @param {string} defaults the string containing the JSON rappresentation of the last configuration values
     * @param {function} save_configuration the function used to save the new configuration
     */
    setup_form: function(defaults, save_configuration) {
        let form = $(config.selectors.config_form);
        form.empty();
        $.each(config.form_fields, function(i, values) {
            let fieldset = forms.add_fieldset(values.title, form);
            let args = configurator.get_args(defaults, values.name);
            $.each(values.items, function(j, item) {
                forms.add_field(item, fieldset, args[item.name]);
            });
        });
        let submit_button = forms.get_submit_button("update_config", "Update Configuration", "info");
        submit_button.addClass("offset-sm-3");
        form.append(submit_button);
        form.submit(function(event) {
            event.preventDefault();
            save_configuration();
        });
        $('[data-toggle="popover"]').popover({trigger: "hover"});
    }
}

export {
    show_error,
    forms,
    configurator
}