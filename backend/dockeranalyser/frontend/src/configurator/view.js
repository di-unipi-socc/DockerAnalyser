import * as config from './config'
import * as vutils from '../common/viewutils'

var show_error = function(msg) {
    vutils.show_error(msg, config.vars.step_id);
}

var forms = {
    add_fieldset: function(label, container) {
        let fieldset = $("<fieldset />").attr({"class": "container"});
        let legend = $("<legend />").html(label);
        fieldset.append(legend);
        if (container)
            $(container).append(fieldset);
        return fieldset;
    },
    add_field: function(field, container, default_value) {
        if (!default_value)
            default_value = "";
        let div = $("<div />").attr({"class": "row"});
        let is_checkbox = (field.type == "checkbox");
        //let is_number = (type == "number");
        let input_class = "col-sm-4";
        let label_class = "col-sm-2";
        let help_class =  "col-sm-6";
        if (is_checkbox) {
            input_class = "col-sm-6";
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
        //let help = $("<small />").attr({"class": "form-text text-muted"}).html(field.help);
        let help = vutils.get_help_icon(field.help);
        help_container.append(help);
        div.append(input_container);
        div.append(help_container);
        if (container)
            $(container).append(div);
        return div;
    },
    get_submit_button: function(id, value, btn_class) {
        return $("<input />").attr({"type": "submit", "class": "btn btn-"+btn_class, "value": value, "id": id});
    }
}

var configurator = {
    /*get_args: function(defaults, service) {
        let args = null;
        $.each(defaults, function(idx, item) {
            if (item.service == service) {
                args = item.args;
                return false;
            }
        });
        return args;
    },*/
    get_args: function(defaults, service) {
        let detail = defaults.detail;
        detail = detail.replace(/None/g, "null");
        detail = detail.replace(/'/g, '"');
        detail = JSON.parse(detail);
        let command = detail[service].command;
        let args = {};
        $.each(command, function(idx, arg) {
            let parts = arg.split("=");
            let name = parts[0].replace("--", "")
            let value = true;  // If present, is set
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
        let clear_button = forms.get_submit_button("default_config", "Reset Defaults", "danger");
        clear_button.click(function(event) {
            event.preventDefault();
            configurator.setup_form(defaults, save_configuration);
        });
        form.append(clear_button);
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