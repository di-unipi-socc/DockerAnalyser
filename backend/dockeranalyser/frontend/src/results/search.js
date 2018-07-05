import * as config from './config'
import * as utilities from './utilities'
import * as model from '../common/model'
import * as vutils from '../common/viewutils'
import * as view from './view'
import * as api from './api'

var module_basename = "search";
var actions = [{
    name: "sample",
    title: "Sample Image",
    icon: "list",
    style: "info",
    modal: config.selectors.sample_image_modal,
    action: null
}, {
    name: "add_all",
    title: "Add All Fields",
    icon: "plus",
    style: "info",
    modal: null,
    action: function() {
        // NOTA: se svuoto rimuovo anche i potenziali campi custom gia' aggiunti
        //view.search.empty_search_form();
        view.search.setup_search_form();
    },
}, {
    name: "remove_all",
    title: "Remove All Fields",
    icon: "minus",
    style: "danger",
    modal: null,
    action: function() {
        model.clear_search_attributes();
        view.search.empty_search_form();
        view.search.search_form_visibility();
    }
}];

var is_searchable_field = function(type) {
    return ($.inArray(type, config.vars.not_acceped_fields) == -1);
};

var search = function(page) {
    if (!page)
        page = 1;
    let len = model.len_search_attributes();
    if (len == 0)
        return;
    let attributes = model.get_search_attributes();
    var params = {};
    $.each(attributes, function(attribute, vals) {
        let value = null;
        if (vals.type == "string" || vals.type == "number")
            value = view.result_forms.get_value(attribute);
        //else if (vals.type == "number")  // Gestire tutti i casi - Deactivated until ranges search is available
        //    value = [view.result_forms.get_value(attribute+"_from"), view.result_forms.get_value(attribute+"_to")];
        else if (vals.type == "boolean")
            value = (view.result_forms.get_value(attribute) == 't');
        attributes[attribute].value = value;
        if (value != null)
            params[attribute] = value;
    });
    console.log("search params", params);
    model.update_search_attributes(attributes);
    api.search(params, function(images, count, pages) {
        view.results.show_results(images, count, pages, page, search);
        vutils.fix_height(config.vars.step);
    }, page);
};

var set_search_attribute_list = function() {
    let select = $(config.selectors.custom_search_form_select);
    let attribute_names = model.get_attribute_names();
    let attributes = model.get_attributes();
    attribute_names.sort();
    $.each(attribute_names, function(idx, val) {
        let type = attributes[val];
        if (is_searchable_field(type)) {
            let option_label = val + " (" + type + ")"; 
            let option = $("<option />").attr({"value": val}).html(option_label);
            select.append(option);
        }
    });
};

var has_subfield = function(attribute) {
    if (attribute && attribute != "") {
        let type = model.get_attribute_type(attribute);
        return (type == "object");
    }
    return false;
};

// Valida e inserisce
var add_selected_field = function(attribute, subfield) {
    attribute = $.trim(attribute);
    if (attribute && attribute != "") {
        var type = model.get_attribute_type(attribute);
        if (type == "object") {
            subfield = $.trim(subfield);
            if (subfield && subfield != "") {
                // Validazione: il nome non deve contenere spazi e può contenere solo punti o underscore
                if (utilities.acceptable_field_name(subfield)) {
                    attribute = attribute + "." + subfield;
                    type = "string";
                }
            } else {
                // Show error
                // return
            }
        }
        view.search.add_field(attribute, type);
    } else {
        // Show error
    }
}

// Valida e inserisce
var add_custom_field = function(attribute) {
    attribute = $.trim(attribute);
    // Validare: non deve contenere spazi e può contenere solo punti o underscore
    if (attribute && attribute != "" && utilities.acceptable_field_name(attribute)) {
        let type = model.get_attribute_type(attribute);
        // Verificare che il nome non coincida con quello di un attributo esistente?
        view.search.add_field(attribute, "string");
    } else {
        // Show error
    }
}

var init = function(container) {
    //view.search.setup(container);
    // Subfield selection 
    vutils.setup_action_buttons(module_basename, actions);
    view.search.setup_sample_modal();
    $(config.selectors.custom_search_form_subfield).hide();
    view.search.search_form_visibility();
    $(config.selectors.custom_search_form_select).change(function(event) {
        let attribute = $(config.selectors.custom_search_form_select).val();
        if (has_subfield(attribute))
            $(config.selectors.custom_search_form_subfield).show();
        else
            $(config.selectors.custom_search_form_subfield).hide();
    });
    // Adds a particular field to the search form. It may be a sub-field
    $(config.selectors.custom_search_form).submit(function(event) {
        event.preventDefault();
        add_selected_field($(config.selectors.custom_search_form_select).val(), $(config.selectors.custom_search_form_subfield).val());
    });
    // Adds a totally custom field to the search form. It may be a sub-field
    $(config.selectors.custom_search_form_free).submit(function(event) {
        event.preventDefault();
        add_custom_field($(config.selectors.custom_search_form_free_input).val());
    });
    // Search within the analysed images
    $(config.selectors.results_search_form).submit(function(event) {
        event.preventDefault();
        search();
    });
};

export {
    init,
    set_search_attribute_list,
    search
}