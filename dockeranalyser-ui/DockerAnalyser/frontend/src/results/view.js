/**
 * Results view module.
 * @module results/view
 */

import * as settings from '../common/settings'
import * as config from './config'
import * as utilities from './utilities'
import * as model from '../common/model'
import * as modal from '../common/modals'
import * as vutils from '../common/viewutils'
import * as search_module from './search'
import Chart from 'chart.js';
import pagination from 'paginationjs';

/**
 * Shows a general error message.
 * @param {string} msg the error message
 */
var show_error = function(msg) {
    vutils.show_error(msg, config.vars.step_id);
}

/**
 * Returns a new button that removes a div.
 * @returns {jQuery} the jQuery object rapresenting the new button
 */
var get_close_button = function() {
    let icon = $("<span />").attr({"aria-hidden": "true"}).html("&times;");
    let button = $("<button />").attr({"type": "button", "class": "close", "aria-label": "Close"});
    button.append(icon);
    return button;
};

/**
 * Returns a new button that collapses a specific div.
 * It contains both buttons to open and close the div. Only one is show at a time, via CSS.
 * @param {string} id the div id
 * @returns {jQuery} the jQuery object rapresenting the new button
 */
var get_reduce_button = function(id, is_open) {
    let button = $("<button />").attr({
        "class": "close reduce_button", 
        "type": "button",
        "data-toggle": "collapse",
        "data-target": "#"+id,
        "aria-expanded": is_open ? "true" : "false",
        "aria-controls": id,
    });
    button.html('<i class="fas fa-window-minimize" aria-hidden="true"></i><i class="far fa-window-maximize" aria-hidden="true"></i>');
    return button;
};

/**
 * Handles generation of the custom search form.
 * @namespace
 */
var result_forms = {
    /**
     * Returns a proper id for a search field, replacing unwanted characters with underscores.
     * @param {string} name the field name
     * @returns {string} the correct id
     */
    get_search_id: function(name) {
        return "search_" + name.replace(/[.]/g, "_");
    },
    /**
     * Generates an input field and adds it to a specified container.
     * @param {string} container the container selector
     * @param {string} type the field type
     * @param {string} id the field id
     * @param {string} name  the field name
     * @param {string} title the field label
     */
    get_input: function(container, type, id, name, title) {
        let is_checkbox = (type == "checkbox");
        // let is_number = (type == "number");   // Deactivated until ranges search is available
        let is_number = false;
        let input_class = "col-sm-10";
        let label_class = "col-sm-2";
        if (is_number) {
            input_class = "col-sm-8";
            label_class = "col-sm-4";
        }
        let input = $("<input />").attr({
            "type": type,  // text, number, checkbox
            "name": name,
            "id": id,
            "class": is_checkbox ? "form-check-input" : "form-control form-control-sm", 
            "placeholder": name
        });
        let label = $("<label />").attr({
            "for": id,
            "class": "capitalize " + (is_checkbox ? " form-check-label" : label_class + " colon"), 
        });
        label.html(title);
        
        if (is_checkbox) {
            input.attr("value", "t");
            $(container).append(input);
            $(container).append(label);
        } else {
            let div = $("<div />").attr({"class": input_class});
            div.append(input);
            $(container).append(label);
            $(container).append(div);
        }
    },
    /**
     * Generates a new form row, including an input, its label and its remove button.
     * @param {string} type the field type
     * @param {string} name the field name
     * @returns {jQuery} the full row element
     */
    get_field: function(type, name) {
        let row_container = $("<div />").attr("class", "row no-gutters");
        if (type == "boolean")
            row_container.addClass("form-check");
            row_container.addClass("form-group row no-gutters");
        let container = $("<div />").attr("class", "col-11 row no-gutters");
        let id = result_forms.get_search_id(name);
        let title = utilities.readable(name);
        let input_type = "text";
        if (type == "number")
            input_type = "number";
        else if (type == "boolean")
            input_type = "checkbox";
        // Deactivated until ranges search is available
        /*if (type == "number") {
            let cnt1 = $("<div />").attr("class", "col-6 row no-gutters");
            result_forms.get_input(cnt1, input_type, id+"_from", name, title+" from");
            let cnt2 = $("<div />").attr("class", "col-6 row no-gutters");
            result_forms.get_input(cnt2, input_type, id+"_to", name, title+" to");
            container.append(cnt1);
            container.append(cnt2);
        } else */
            result_forms.get_input(container, input_type, id, name, title);
        let remove_div = $("<div />").attr({"class": "col-1 text-center"});
        let remove_button = $("<input />").attr({"type": "submit", "class": "btn btn-outline-danger btn-sm", "value": "-"});
        remove_button.click(function(event) {
            event.preventDefault();
            row_container.remove();
            let result = model.remove_search_attribute(name);
            if (result > 0)
                search.search_form_visibility();
        });
        remove_div.append(remove_button);
        row_container.append(container);
        row_container.append(remove_div);
        return row_container;
    },
    /**
     * Gets the value from a specific field.
     * @param {string} name the field id
     * @returns {string} the field current value
     */
    get_value: function(name) {
        let id = result_forms.get_search_id(name);
        return $("#"+id).val();
    },
    /**
     * Generates a text input.
     * @param {string} name the field name, will be used as id too
     * @param {string} placeholder the field placeholder
     * @returns {jQuery} the new input element
     */
    get_txt_input: function(name, placeholder) {
        return $("<input />").attr({"type": "text", "class": "form-control", "name": name, "id": name, "placeholder": placeholder});
    },
    /**
     * Generates a new select.
     * @param {string} id the field id
     * @returns {jQuery} the new select element
     */
    get_select: function(id) {
        return $("<select />").attr({"class": "custom-select", "name": id, "id": id});
    },
    /**
     * Generates a submit button.
     * @param {string} id the field id
     * @param {string} value the label for the button
     * @returns {jQuery} the new button element
     */
    get_submit_button: function(id, value) {
        return $("<input />").attr({"type": "submit", "class": "btn btn-info", "value": value, "id": id});
    }
};

/**
 * @namespace 
 */
var results = {
    /**
     * Shows the new images total count.
     * @param {number} num the numer to show
     */
    show_total: function(num) {
        $(config.selectors.num_images_id).html(num);
    },
    /**
    * Shows the paginated results list.
    * @see {@link http://pagination.js.org}
    * @param {string} url the search url, including the search parameters
    */
    setup_pagination: function(url) {
        $("#"+config.selectors.pagination_container).empty();
        $("#"+config.selectors.pagination_container).pagination({
            dataSource: url,
            totalNumberLocator: function(response) {
                return response.count;
            },
            locator: "images",
            pageSize: settings.vars.page_size,
            alias: {
                pageNumber: "page",
                pageSize: "limit"
            },
            classPrefix: "paginationjs",  // or paginationjs-theme-blue
            callback: function(data, pagination) {
                let title = $("<h4 />").html(pagination.totalNumber + " results found");
                $(config.selectors.results_list_id).empty();
                $(config.selectors.results_list_id).append(title);
                $.each(data, function(idx, item) {
                    let div = $("<div />").attr({"class": "card"});
                    let header_id = "header_"+idx;
                    let body_id = "body_"+idx;
                    let header_container = $("<div />").attr({"class": "card-header", "id": header_id});
                    let header = $("<h5 />").attr({"class": "mb-0"});
                    let button = $("<button />").attr({
                        "class": "btn btn-link image-id", 
                        "data-toggle": "collapse",
                        "data-target": "#"+body_id,
                        "aria-expanded": "false",
                        "aria-controls": body_id,
                    });
                    button.html('<i class="fas fa-caret-right"></i><i class="fas fa-caret-down"></i> ' + item["name"]);
                    header.append(button);
                    header_container.append(header);
                    let body_container = $("<div />").attr({
                        "id": body_id,
                        "class": "collapse",
                        "aria-labelledby": header_id,
                    });
                    let body = $("<div />").attr({"class": "card-body"});
                    div.on('hidden.bs.collapse', function() {
                        vutils.fix_height(config.vars.step);
                    });
                    div.on('shown.bs.collapse', function() {
                        vutils.fix_height(config.vars.step);
                    });
                    body.append(vutils.display_object(item, 0));
                    body_container.append(body);
                    div.append(header_container);
                    div.append(body_container);
                    $(config.selectors.results_list_id).append(div);
                });
                $(config.selectors.results_list_id).show();
                vutils.fix_height(config.vars.step);
            }
        });
    },
    /**
     * Generates the container for a chart.
     * It includes a title and button to close/remove the chart.
     * @param {string} id the chart id
     * @param {string} type the attribute type
     * @param {string} attribute the attribute name
     * @param {string} approximation the chosen approximation type
     * @param {booelan} is_open true if the chart should be shown open
     */
    get_chart_card: function(id, type, attribute, approximation, is_open) {
        let title = type + " chart for <b>" + attribute + "</b> attribute with <i>" + approximation + "</i> approximation";
        let cnt = $("<div />").attr("class", "card");
        let header = $("<div />").attr("class", "card-header").html(utilities.capitalize(title));
        let button = get_close_button();
        button.click(function(event) {
            event.preventDefault();
            cnt.remove();
            model.remove_chart(attribute, type, approximation);
            vutils.fix_height(config.vars.step);
        });
        header.append(button);
        let body_id = "card_body_" + id;
        let body = $("<div />").attr({"class": "card-body collapse show", "id": body_id});
        let div = $("<div />").attr("id", id).attr("class", "graph_container");
        body.append(div);
        cnt.on('hidden.bs.collapse', function() {
            model.close_chart(attribute, type, approximation);
            vutils.fix_height(config.vars.step);
        });
        cnt.on('shown.bs.collapse', function() {
            model.open_chart(attribute, type, approximation);
            vutils.fix_height(config.vars.step);
        });
        let min_button = get_reduce_button(body_id, is_open);
        header.append(min_button);
        cnt.append(header);
        cnt.append(body);
        if (!is_open)
            body.collapse('hide');
        return cnt;
    },
};

/**
 * Handles custom search form generation.
 * @namespace
 */
var search = {
    /**
     * Setups the custom search form generator form.
     * @param {string} the container selector or the container element 
     */
    setup: function(container) {
        let div = vutils.get_main_box(config.vars.search_form_cnt_id, config.vars.search_form_label);
        // Search Form generator setup
        let custom_form = $("<form />").attr({"class": "form-inline", "name": config.selectors.custom_search_form, "id": config.selectors.custom_search_form});
        // Custom form first row
        let cnt1 = $("<div />").attr("class", "inline-form-group");
        let cnt2 = $("<div />").attr("class", "inline-form-group");
        let select = result_forms.get_select(config.selectors.custom_search_form_select);
        let add_button = result_forms.get_submit_button(config.selectors.custom_search_form_add, "+");
        add_button.click(function(event) {
            event.preventDefault();
            search.add_field(select.val(), null);
        });
        let add_all_button = result_forms.get_submit_button(config.selectors.custom_search_form_add_all, "Add All");
        add_all_button.click(function(event) {
            event.preventDefault();
            $(config.selectors.results_search_form_id + " fieldset").empty();
            search.setup_search_form();
        });
        cnt1.append(select);
        cnt1.append(add_button);
        cnt1.append(add_all_button);
        // Custom form second row
        let input_custom = result_forms.get_txt_input("add_custom_input", "Custom Field");
        let add_button_custom = result_forms.get_submit_button(config.selectors.custom_search_form_add, "+");
        add_button_custom.click(function(event) {
            event.preventDefault();
            search.add_field(input_custom.val(), "string");
        });
        cnt2.append(input_custom);
        cnt2.append(add_button_custom);
        custom_form.append(cnt1);
        custom_form.append(cnt2);
        div.append(custom_form);
        // Search Form setup 
        let search_form = $("<form />").attr({"name": config.selectors.results_search_form, "id": config.selectors.results_search_form});
        let fieldset = $("<fieldset />");
        let search_button = result_forms.get_submit_button(config.selectors.results_search_button, "Search");
        search_button.click(function(event) {
            event.preventDefault();
            search_module.search();
        });
        search_form.append(fieldset);
        search_form.append(search_button);
        div.append(search_form);
        // Results display setup
        let results = $("<div />").attr("id", config.selectors.results_list);
        div.append(results);
        $(container).append(div);
    },
    /**
     * Removes all fields from the custom search form 
     */
    empty_search_form: function() {
        $(config.selectors.results_search_form + " fieldset").empty();
    },
    /**
     * Decides if the custom search form should be show (if there are any fields). 
     */
    search_form_visibility: function() {
        let len = model.len_search_attributes();
        if (len > 0)
            $(config.selectors.results_search_form).show();
        else
            $(config.selectors.results_search_form).hide();
        vutils.fix_height(config.vars.step);
    },
    /**
     * Setups a search form with all attributes. 
     */
    setup_search_form: function() {
        // Date and range search are not available at the moment
        let attributes = model.get_attributes();
        let groups = {"string": [], "number": [], "boolean": []};
        // Fields are grouped by type, to make them more readable and graceful
        $.each(attributes, function(attribute, type) {
            if (type == "string" || type == "number" || type == "boolean")
                groups[type].push(attribute);
        });
        $.each(groups, function(type, attrs) {
            attrs.sort();
            $.each(attrs, function(idx, attr) {
                search.add_field(attr, type);
            });
        });
    },
    /**
     * Adds a new field to the custom search form
     * @param {string} name the field name 
     * @param {string} name the field type
     */
    add_field: function(name, type) {
        if (type == null) {
            type = model.get_attribute_type(name);
        }
        let field = result_forms.get_field(type, name);
        let result = model.add_search_attribute(name, type);
        if (result > 0) {
            $(config.selectors.results_search_form + " fieldset").append(field);
            search.search_form_visibility();
        }
    },
    /**
     * Setups the Sample Image modal. 
     */
    setup_sample_modal: function() {
        let body = modal.setup(config.selectors.sample_image_modal, "Sample Image", null, null, true);
        let div = $("<div />").attr({"id": config.selectors.sample_image_div});
        body.append(div);
    }
};

/**
 * Generates the colors (and a lighter variation of each) used on a graph.
 * @param {number} num the total number of colors
 * @returns {Array} the generated colors
 */
var get_colors = function(num) {
    let colors = [];
    let colors2 = []
    for (let i=1; i<=num; i++) {
        let c = utilities.rainbow(num, i);
        let cl = utilities.lighten(c, 2);
        colors.push(c);
        colors2.push(cl);
    }
    return [colors, colors2];
};

/**
 * Takes the values to show in a graph and divides the in ranges, based on the requested approximation:
 * - "none" does nothing
 * - "ranges" gropus results in <max_chart_groups> groups defining ranges (can be used only on numeric values)
 * - "others" keeps the <max_chart_groups> more significative values and groups the others under the label "others"
 * @see results/config.vars.max_chart_groups
 * @param {Object} values original values
 * @param {string} approximation the type of approximation desired (none, ranges, others)
 * @returns {Object} the approximated values or the original ones if no approximation was made
 */
var get_ranges = function(values, approximation) {
    let keys = Object.keys(values);
    let max = config.vars.max_chart_groups;
    let results = {};
    if (approximation == "none" || keys.length <= max)
        return values;
    if (approximation == "ranges") {
        // Keys must be integers
        let intkeys = utilities.array_to_int(keys);
        intkeys.sort((a, b) => a - b);   // ES6 Arrow Function
        let max_val = intkeys[intkeys.length-1];
        if (max_val % max != 0)
            max_val = max*(Math.floor((max_val+max)/max));  // Get next multiple of max
        let step = max_val/max;
        let tmp = [];
        for (let i=0; i<max; i++) {
            tmp[i] = 0;
        }
        $.each(intkeys, function(idx, key) {
            let index = Math.floor(key/step);
            if (index == max)
                index = index-1;  // If the last one corresponds to the max
            tmp[index] += values[""+key];
        });
        let j = 0;
        for (let i=0; i<max_val; i=i+step) {
            let label = (i+1) + " - " + (i+step);
            results[label] = tmp[j];
            j++;
        }
    }
    else if (approximation == "others") {
        let reverse = {};
        let intkeys = [];
        $.each(values, function(key, val) {
            reverse[val] = key;
            intkeys.push(parseInt(val, 10));
        });
        intkeys.sort((a, b) => b - a);   // ES6 Arrow Function; reverse sort
        let others = intkeys.splice((max-1), intkeys.length);
        let others_count = 0;
        $.each(others, function(idx, key) {
            let original_key = reverse[""+key];
            others_count += values[original_key];
        });
        $.each(intkeys, function(idx, key) {
            let original_key = reverse[""+key];
            results[original_key] = values[original_key];
        });
        results["others"] = others_count;
    }
    return results;
}

/**
 * Handles chart generation.
 * Uses the Chart.js library {@link https://www.chartjs.org}
 * @namespace
 */
var charts = {
    /**
     * Setups the chart generation form using the values found in the graphs variable (in config.js).
     * When the form is submitted, it adds the new chart to the model and calls a function to create the chart itself.
     * @see results/config.graphs
     * @param {function(string, string, string, boolean)} show_graph a function called when the form is submitted
     */
    setup_charts_form: function(show_graph) {
        let form = $(config.selectors.add_chart_form);
        $.each(config.graphs, function(key, vals) {
            let id = "select_" + key;
            let select = $("<select />").attr({"name": id, "id": id, "class": "custom-select", "required": "required"});
            let option = $("<option />").attr({"value": ""}).html(vals.label+":");
            select.append(option);
            $.each(vals.options, function(idx, val) {
                let option_id = "option_" + key + "_" + val.value.toLowerCase();
                option = $("<option />").attr({"value": val.value, "id": option_id}).html(val.label);
                select.append(option);
            });
            form.append(select);
        });
        let input = $("<input />").attr({"type": "submit", "class": "btn btn-info", "value": "Create"});
        form.append(input);
        form.submit(function(event) {
            event.preventDefault();
            let type = $("#select_types").val();
            let attribute = $("#select_attributes").val();
            let approx = $("#select_approx").val();
            let added = model.add_chart({type: type, attribute: attribute, approx: approx});
            if (added > 0)
                show_graph(type, attribute, approx, true);
        });
    },
    /**
     * Creates a new chart and adds it to the page.
     * It manipulates the provided values based on the number of different values and the approximation method.
     * @see {@link https://www.chartjs.org}
     * @param {string} type chart type
     * @param {string} container selector of the container element
     * @param {string} values complete list of values 
     * @param {string} attribute name of the selected attribute
     * @param {string} approximation name of the selected approximation method
     */
    chart: function(type, container, values, attribute, approximation) {
        let id = "chart_" + attribute + "_" + type + "_" + approximation;
        let canvas = $("<canvas />").attr({"id": id, "width": "200", "height": "200"});
        $(container).append(canvas);
        let labels = [];
        let vals = [];
        // If I have too many different values, I should divide them in ranges
        values = get_ranges(values, approximation);
        $.each(values, function(key, item) {
            labels.push(key);
            vals.push(item);
        });
        var ctx = $("#"+id);
        var colors = get_colors(vals.length);
        var scales = {};
        let legend_display = true;
        if (type == "bar" || type == "horizontalBar") {
            legend_display = false;
            let ylabel = (type == "bar") ? "images" : attribute;
            let xlabel = (type == "bar") ? attribute : "images";
            scales = {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function(value, index, values) {
                           return value;
                        }
                    },
                    scaleLabel: {
                        display: true,
                        labelString: ylabel,
                        fontSize: 14
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: xlabel,
                        fontSize: 14
                    }
                }]
            };
        }
        var chart = new Chart(ctx, {
            type: type,
            data: {
                labels: labels,
                datasets: [{
                    //label: attribute,
                    data: vals,
                    backgroundColor: colors[1],
                    borderColor: colors[0],
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: legend_display,
                },
                scales: scales
            }
        });

    }
};

export {
    show_error,
    confirm,
    get_text_button,
    get_button,
    results,
    charts,
    search,
    result_forms
};
