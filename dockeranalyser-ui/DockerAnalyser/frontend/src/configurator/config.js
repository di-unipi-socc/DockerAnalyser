/**
 * Configurator configuration constants.
 * @module configurator/config
 */

/**
 * Used to generate the configuration form.
 * @type {Array} 
 */
 var form_fields = [{
    "name": "crawler",
    "title": "Crawling Options",
    "command": "crawl",
    "items": [
        {
            "name": "si",
            "label": "Sample Images",
            "placeholder": "All",
            "help": "Total number of images to crawl",
            "type": "number"
        }, {
            "name": "fp",
            "label": "From Page",
            "placeholder": "From Page",
            "help": "Start crawling form this page",
            "type": "number"
        }, {
            "name": "ps",
            "label": "Page Size",
            "placeholder": "Page Size",
            "help": "Consider pages like having this size",
            "type": "number"
        }, {
            "name": "policy",
            "label": "Policy",
            "help": "Start from images with a higher number of stars or pulls",
            "type": "radio",
            "values": [{
                "value": "stars_first", 
                "label": "Stars First"
            }, {
                "value": "pulls_first",
                "label": "Pulls First"
            }]
        }, {
            "name": "min-stars",
            "label": "Minimum Stars",
            "placeholder": "Minimum Stars",
            "help": "The minimum number of stars that an image must have",
            "type": "number"
        }, {
            "name": "min-pulls",
            "label": "Minimum Pulls",
            "placeholder": "Minimum Pulls",
            "help": "The minimum number of pulls that an image must have",
            "type": "number"
        }, {
            "name": "random",
            "label": "Random",
            "help": "Crawl images randomly instead of sequentially",
            "type": "checkbox"
        }, {
            "name": "only-official",  // Valid if set
            "label": "Only Official",
            "help": "Crawl only the official images",
            "type": "checkbox"
        }, {
            "name": "only-automated",  // Valid if set
            "label": "Only Automated",
            "help": "Crawl only images automatically created from a GitHub repository",
            "type": "checkbox"
        }, 
    ]}, 
    /*{
    "name": "scanner",
    "title": "Scanner Configuration",
    "items": [
        {
            "name": "replicas",
            "label": "Replicas",
            "help": "Number of parallel scanners to run",
            "type": "number"
        }
    ]}, */
]

/**
 * Misc variables.
 * @type {Object}
 * @property {number} step the numeric id of this secion
 * @property {string} step_id the text id of this secion
 */
var vars = {
    step: 1,
    step_id: "config",
}

/**
 * Misc CSS selectors (ids, classes).
 * @type {Object} 
 */
var selectors = {
    config_form: "#config_form"
}

export {
    form_fields,
    vars,
    selectors
}