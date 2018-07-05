import * as config from './config'
import * as settings from '../common/settings'
import * as vutils from '../common/viewutils'
import * as model from '../common/model'
import * as view from './view'

// La validazione viene già fatta dal form, ma idealmente andrebbe ripetuta
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

var post_configuration = function(data) {
    $.post(settings.urls.compose.config, JSON.stringify(data))
        .done(function(response) {
            if (response.err != 0)
                view.show_error(response.msg);
        })
        .fail(function(xhr, status, error) {
            console.log(xhr.responseText);
            view.show_error(settings.msgs.error_server);
        }); 
}

var get_configuration = function() {
    $.getJSON(settings.urls.compose.config)
        .done(function(response) {
            if (response.err == 0)
                view.configurator.setup_form(response, save_configuration);
            else 
                view.show_error(response.msg);
        })
        .fail(function() {
            view.show_error(settings.msgs.error_server);
        }); 
};

var refresh  = function() {
    vutils.clean_messages(config.vars.step_id);
    get_configuration();
};

var init = function() {
    get_configuration();
};

/*
POST /compose/config
content-type: application/json
{
    "service": "crawler",  
    "command": "crawl",
    "args": {
            "force-page":true,
            "si": 0,
            "random": false,
            "fp": 10,
            "ps": 0,
            "policy": "pulls_first",
            "min-stars" : 0,
            "min-pulls" : 0,
            "only-automated": true,
            "only-official": false    
        }          
    }
*/

export {
    init,
    refresh,
    save_configuration
}