var backend_url = "http://127.0.0.1:8000";

var urls = {
    requirements: backend_url + "/requirements/search",
    requirements_validate: backend_url + "/requirements/validate",
    suggestions: backend_url + "/suggestions/images_service",
    code_validate: backend_url + "/suggestions/validate",
    versions: "https://pypi.org/pypi/LIB/json",
    images: {
        list: backend_url + "/images/list",
        stats: backend_url + "/images/stats",
        search: backend_url + "/images/search",  // https://github.com/di-unipi-socc/DockerAnalyser/blob/master/storage/README.md
        drop: backend_url + "/images/drop",
        export: backend_url + "/images/export",
    },
    compose: {
        upload: backend_url + "/compose/upload", 
        build: backend_url + "/compose/build", 
        config: backend_url + "/compose/config",
        up: backend_url + "/compose/up",
        scale: backend_url + "/compose/up",
        stop: backend_url + "/compose/stop",
        logs: backend_url + "/compose/logs",
        status: backend_url + "/compose/status"
    }
};

var msgs = {
    error_generic: "An error occurred",
    error_server: "Unable to reach server",
    error_no_results: "No results found",
    error_file_exists: "File already exists",
    error_wrong_type: "Wrong File Type",
    error_req_not_found: "Libraries not found: ",
    error_validation: "Validation Error. Please check your analysis.py. code",
    error_empty_filename: "Please specify a file name",
    confirm_upload_zip: "Be aware that uploading a new package you will overwrite your current work!",
    confirm_remove_file: "You modified this file, if you remove it your work will be lost!",
    confirm_clear_requirements: "All inserted requirements will be removed!",
    confirm_clear_uploads: "All uploaded files will be removed",
    confirm_reset: "All your current work will be lost!",
    confirm_drop_images: "All images will be removed!",
    info_scale: "Service scaled succesfully",
    info_build: "Scanner built succesfully",
};

var help = {
    add_file: "Please specify a name for the new file, including its extension",
    scale_scanner: "Please specify the new total number of scanner instances"
};

export {
    urls,
    msgs,
    help
}