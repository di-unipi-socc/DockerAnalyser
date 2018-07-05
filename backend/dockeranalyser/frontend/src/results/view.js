import * as config from './config'
import * as utilities from './utilities'
import * as model from '../common/model'
import * as modal from '../common/modals'
import * as forms from '../common/forms'
import * as vutils from '../common/viewutils'
import * as search_module from './search'
import Chart from 'chart.js';

var show_error = function(msg) {
    vutils.show_error(msg, config.vars.step_id);
}

var get_close_button = function() {
    let icon = $("<span />").attr({"aria-hidden": "true"}).html("&times;");
    let button = $("<button />").attr({"type": "button", "class": "close", "aria-label": "Close"});
    button.append(icon);
    return button;
};

var get_reduce_button = function(id) {
    let button = $("<button />").attr({
        "class": "close reduce_button", 
        "type": "button",
        "data-toggle": "collapse",
        "data-target": "#"+id,
        "aria-expanded": "true",
        "aria-controls": id,
    });
    button.html('<i class="fas fa-window-minimize" aria-hidden="true"></i><i class="far fa-window-maximize" aria-hidden="true"></i>');
    return button;
};

var result_forms = {
    get_search_id: function(name) {
        return "search_" + name.replace(/[.]/g, "_");
    },
    get_input: function(container, type, id, name, title) {
        let is_checkbox = (type == "checkbox");
        //let is_number = (type == "number");   // Deactivated until ranges search is available
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
    get_field: function(type, name) {
        let row_container = $("<div />").attr("class", "row no-gutters");
        if (type == "boolean")
            row_container.addClass("form-check");
        //    row_container.addClass("form-check form-check-inline");
        //else
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
    get_value: function(name) {
        let id = result_forms.get_search_id(name);
        return $("#"+id).val();
    },
    get_txt_input: function(name, placeholder) {
        return $("<input />").attr({"type": "text", "class": "form-control", "name": name, "id": name, "placeholder": placeholder});
    },
    get_select: function(id) {
        return $("<select />").attr({"class": "custom-select", "name": id, "id": id});
    },
    get_submit_button: function(id, value) {
        return $("<input />").attr({"type": "submit", "class": "btn btn-info", "value": value, "id": id});
    }
};

var results = {
    show_total: function(num) {
        $(config.selectors.num_images_id).html(num);
    },
    get_pagination: function(pages, current_page, search_function) {
        let nav = $("<nav />").attr({"aria-label": "Search Results Navigation"});
        let ul = $("<nav />").attr({"class": "pagination justify-content-end"});
        //let prev = $('<li class="page-item"><a class="page-link disabled" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></a></li>');
        //let next = $('<li class="page-item"><a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></a></li>');
        //ul.append(prev);
        for (let i=1; i<=pages; i++) {
            let li = $('<li class="page-item page-item-' + i +'"><a class="page-link" href="#">' + i + '</a></li>');
            if (i == current_page)
                li.addClass("current_page");
            li.click(function(event) {
                event.preventDefault();
                search_function(i);
            });
            ul.append(li);
        }
        //ul.append(next);
        nav.append(ul);
        return nav;
    },
    show_results: function(items, count, pages, current_page, search_function) {
        let title = $("<h4 />").html(count + " results found");
        $(config.selectors.results_list_id).empty();
        $(config.selectors.results_list_id).append(title);
        $.each(items, function(idx, item) {
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
            button.html('<i class="fas fa-caret-right"></i><i class="fas fa-caret-down"></i> ' + item["repo_name"]);
            header.append(button);
            header_container.append(header);
            let body_container = $("<div />").attr({
                "id": body_id,
                "class": "collapse",
                "aria-labelledby": header_id,
            });
            let body = $("<div />").attr({"class": "card-body"});
            body.on('hidden.bs.collapse', function() {
                vutils.fix_height(config.vars.step);
            });
            body.on('shown.bs.collapse', function() {
                vutils.fix_height(config.vars.step);
            });
            body.append(vutils.display_object(item, 0));
            body_container.append(body);
            div.append(header_container);
            div.append(body_container);
            $(config.selectors.results_list_id).append(div);
        });
        if (items.length < count) {
            let pagination = results.get_pagination(pages, current_page, search_function);
            $(config.selectors.results_list_id).append(pagination);
        }
        $(config.selectors.results_list_id).show();
    },
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
        body.on('hidden.bs.collapse', function() {
            model.close_chart(attribute, type, approximation);
            vutils.fix_height(config.vars.step);
        });
        body.on('shown.bs.collapse', function() {
            model.open_chart(attribute, type, approximation);
            vutils.fix_height(config.vars.step);
        });
        let min_button = get_reduce_button(body_id);
        header.append(min_button);
        cnt.append(header);
        cnt.append(body);
        if (!is_open)
            body.collapse('hide');
        return cnt;
    },
};

var search = {
    setup: function(container) {
        let div = vutils.get_main_box("results_search_container", "Image Search");  // Spostare in config o in variabili
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
    empty_search_form: function() {
        $(config.selectors.results_search_form + " fieldset").empty();
    },
    search_form_visibility: function() {
        let len = model.len_search_attributes();
        if (len > 0)
            $(config.selectors.results_search_form).show();
        else
            $(config.selectors.results_search_form).hide();
        vutils.fix_height(config.vars.step);
    },
    setup_search_form: function() {
        // Al momento non si ricerca per data e per range
        let attributes = model.get_attributes();
        let groups = {"string": [], "number": [], "boolean": []};
        // Raggruppo i campi per tipo, per renderli più leggibili e gradevoli visivamente
        $.each(attributes, function(attribute, type) {
            if (type == "string" || type == "number" || type == "boolean")
                groups[type].push(attribute);
        });
        $.each(groups, function(type, attrs) {
            let cnt = $("<div />");
            //if (type == "boolean")
            //    cnt.addClass("checkbox-container");
            attrs.sort();
            $.each(attrs, function(idx, attr) {
                search.add_field(attr, type);
            });
        });
    },
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
    setup_sample_modal: function() {
        let body = modal.setup(config.selectors.sample_image_modal, "Sample Image", null, null, true);
        let div = $("<div />").attr({"id": config.selectors.sample_image_div});
        body.append(div);
    }
};

var get_colors = function(num) {
    let colors = [];
    let colors2 = []
    for (let i=1; i<=num; i++) {
        let c = utilities.rainbow(num, i);
        let cl = utilities.LightenDarkenColor(c, 2);
        colors.push(c);
        colors2.push(cl);
    }
    return [colors, colors2];
};

var get_ranges = function(values, approximation) {
    // Se ho troppi valori, dovrei dividere i risultati in dei range
    // approximation può essere "ranges" o "others"
    // "none" non fa nulla
    // "ranges" raggruppa i risultati in X gruppi definendo dei ranges, è possibile per i campi numerici
    // "others" mantiene gli X risultati più significativi e raggruppa gli altri in "others"
    let keys = Object.keys(values);
    let len = keys.length;
    let max = config.vars.max_chart_groups;
    let results = {};
    if (approximation == "none" || keys.length <= max)
        return values;
    if (approximation == "ranges") {
        // Le chiavi devono essere intere
        let intkeys = utilities.array_to_int(keys);
        intkeys.sort((a, b) => a - b);   // ES6 Arrow Function
        let max_val = intkeys[intkeys.length-1];
        if (max_val % max != 0)
            max_val = max*(Math.floor((max_val+max)/max));  // Ottengo il prossimo multiplo di max
        let step = max_val/max;
        let tmp = [];
        for (let i=0; i<max; i++) {
            tmp[i] = 0;
        }
        let m = 0;
        $.each(intkeys, function(idx, key) {
            let index = Math.floor(key/step);
            if (index == max)
                index = index-1;  // Nel caso in cui l'ultimo coincida col massimo
            tmp[index] += values[""+key];
        });
        let j=0;
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

var charts = {
    chart: function(type, container, values, attribute, approximation) {
        let id = "chart_" + attribute + "_" + type + "_" + approximation;
        let canvas = $("<canvas />").attr({"id": id, "width": "200", "height": "200"});
        $(container).append(canvas);
        let labels = [];
        let vals = [];
        values = get_ranges(values, approximation);
        $.each(values, function(key, item) {
            labels.push(key);
            vals.push(item);
        });
        // Se ho troppi valori, dovrei dividere i risultati in dei range
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

var exporter = {
    setup_formats: function(formats) {
        let menu = $(config.selectors.export_menu);
        $.each(formats, function(idx, item) {
            let menu_item = $("<a />").attr({"class": "dropdown-item", "href": "#"});
            menu_item.html(item.name);
            menu_item.click(function(event) {
                event.preventDefault();
                item.action();
            });
            menu.append(menu_item);
        });
    }
}

export {
    show_error,
    confirm,
    get_text_button,
    get_button,
    results,
    exporter,
    charts,
    search,
    result_forms
};
