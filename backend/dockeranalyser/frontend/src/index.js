var $ = require("jquery");
var jQuery = require("jquery");

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import 'smartwizard';
import 'smartwizard/dist/css/smart_wizard.min.css';
import 'smartwizard/dist/css/smart_wizard_theme_arrows.min.css';
import 'smartwizard/dist/css/smart_wizard_theme_circles.min.css';
import 'smartwizard/dist/css/smart_wizard_theme_dots.min.css';

var ace = require('ace-builds/src-noconflict/ace');
require('ace-builds/src-noconflict/ext-language_tools');
require("ace-builds/src-noconflict/mode-plain_text");
require("ace-builds/src-noconflict/mode-python");
require("ace-builds/src-noconflict/mode-javascript");
require("ace-builds/src-noconflict/mode-markdown");
require("ace-builds/src-noconflict/mode-html");
require("ace-builds/src-noconflict/mode-css");
require("ace-builds/src-noconflict/mode-sh");

/*$.each(config.languages, function(key, val) {
    let mode = "ace-builds/src-noconflict/mode-"+val.value;
    require(mode);
});*/

import './common/style.scss';

import * as uploader from './editor/uploader'
import * as requirements from './editor/requirements'
import * as editor from './editor/editor'
import * as packager from './editor/packager'
import * as configurator from './configurator/configurator'
import * as results from './results/results'
import * as dashboard from './manage/dashboard'
import * as vutils from './common/viewutils'

$(document).ready(function () {

    // Inizializzazione Editor
    editor.init();
    uploader.init();
    requirements.init();
    packager.init();
    configurator.init();
    dashboard.init();
    results.init();
    vutils.setup_confirm_modal();

    $('#smartwizard').smartWizard({
        theme: "dots", 
        autoAdjustHeight: true, 
        keyNavigation: false,
        useURLhash: false, 
        showStepURLhash: false,
        toolbarSettings: {toolbarPosition: "top"},
        anchorSettings: {enableAllAnchors: true}
    });

    $("#smartwizard").on("showStep", function(e, anchorObject, stepNumber, stepDirection) {
        switch (stepNumber) {
            case 0:  // editor
                break;
            case 1:  // config
                configurator.refresh();
                break;
            case 2:  // manage
                dashboard.refresh();
                break;
            case 3:  // results
                results.refresh();
                break;
        }
    });

    $("#smartwizard").on("leaveStep", function(e, anchorObject, stepNumber, stepDirection) {
        switch (stepNumber) {
            case 0:  // editor
                break;
            case 1:  // config
                configurator.save_configuration();
                break;
            case 2:  // manage
                dashboard.stop_refresh();
                break;
            case 3:  // results
                break;
        }
    });


    /*$("#smartwizard").on("showStep", function(e, anchorObject, stepNumber, stepDirection) {
        console.log("You are on step "+stepNumber+" now");
        vutils.fix_height(stepNumber);
     });*/
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover({trigger: "hover"});

    // Gestione loading
    $(document).on({
        ajaxStart: function() { $("body").addClass("loading"); },
        ajaxStop: function() { $("body").removeClass("loading"); }    
    });

});
