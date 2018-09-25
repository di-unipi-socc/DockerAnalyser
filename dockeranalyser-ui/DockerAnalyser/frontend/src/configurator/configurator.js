/**
 * Configurator module.
 * This module handles the whole "Configuration" section. 
 * The Configuration Form is dinamically generated based on the form_fields variable
 * defined in this folder config.js file.
 * The Configuration Form automatically reloaded when the section is shown and is 
 * automatically saved when the user moves to a different section.
 * @module configurator/configurator
 */
import * as config from './config'
import * as settings from '../common/settings'
import * as vutils from '../common/viewutils'
import * as view from './view'

var module_basename = "config";
var actions = [{
    name: "reset",
    title: "Reset Last Configuration",
    icon: "undo",
    style: "danger",
    modal: null,
    action: function() {
        get_configuration();
    },
}, {
    name: "refresh",
    title: "Refresh",
    icon: "sync",
    style: "info",
    modal: null,
    action: function() {
        refresh();
    },
}];

/**
 * Generates the configuration form and populates it 
 * with the last saved configuration.
 */
var get_configuration = function() {
    $.getJSON(settings.urls.compose.config)
        .done(function(response) {
            $(config.selectors.config_form).show();
            if (response.err == 0)
                view.configurator.setup_form(response.detail, save_configuration);
            else
                view.show_error(response.msg);
            vutils.fix_height(config.vars.step);
        })
        .fail(function() {
            view.show_error(settings.msgs.error_server);
            $(config.selectors.config_form).hide();
        }); 
};

/**
 * Saves the last configuration for all services that can be configured.
 * Data is already validated.
 */
var save_configuration = function() {
    $.each(config.form_fields, function(i, values) {
        let configuration = {
            service: values.name,
            command: values.command,
            args: {}
        };
        $.each(values.items, function(j, item) {
            let value = null;
            if (item.type == "radio")
                value = $(config.selectors.config_form + " input[name=" + item.name + "]:checked").val();
            else if (item.type == "checkbox")
                value = $(config.selectors.config_form + " #" + item.name).is(":checked");
            else {
                value = $(config.selectors.config_form + " #" + item.name).val();
                if (item.type == "number")
                    value = parseInt(value, 10);
            }
            configuration["args"][item.name] = value;
        });
        post_configuration(configuration);
    });
};

/**
 * Sends to the server the new configuration and, if succesful, 
 * reloads the last saved configuration to check everything's ok.
 * @param {Object} data the new configuration
 */
var post_configuration = function(data) {
    $.post(settings.urls.compose.config, JSON.stringify(data))
        .done(function(response) {
            if (response.err == 0) {
                vutils.show_info(settings.msgs.info_config, config.vars.step_id);
                get_configuration();    // Reloads configuration to check success
            } else
                view.show_error(response.msg);
        })
        .fail(function(xhr, status, error) {
            view.show_error(settings.msgs.error_server);
        });
}

/**
 * Refreshes the Configuration section, removing previous messages
 * and reloading the last saved configuration.
 */
var refresh = function() {
    vutils.clean_messages(config.vars.step_id);
    get_configuration();
};

/**
 * Initialises the configurator manager.
 */
var init = function() {
    vutils.setup_action_buttons(module_basename, actions);
};

export {
    init,
    refresh,
    save_configuration
}