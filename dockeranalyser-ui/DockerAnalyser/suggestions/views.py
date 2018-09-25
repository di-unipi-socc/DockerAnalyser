from django.http import JsonResponse
from urllib.request import urlopen
import json

IMAGES_SERVICE_URL = "https://raw.githubusercontent.com/di-unipi-socc/DockerAnalyser/master/analysis/scanner/scanner/core/client_images_service.py"
# ANALYSIS_URL = "https://raw.githubusercontent.com/di-unipi-socc/DockerAnalyser/master/analysis/scanner/scanner/deploy/analysis.py"


def get_images_service_methods():
    """ Downloads the IMAGES_SERVICE_URL file and inspects it.
        Returns a list containing all functions found in the IMAGES_SERVICE_URL file
        with the corresponding comment, if available.
    """
    response = urlopen(IMAGES_SERVICE_URL)
    content = response.read().decode("utf8")
    functions = []
    current_function = None
    in_comment = False
    for line in content.split("\n"):
        line = line.strip()
        if line.strip().startswith("def "):
            function_name = line.split(" ")[1].split("(")[0]
            if function_name == "__init__":
                continue
            arg_names = line.split("(")[1].split(")")[0].split(",")
            arg_names = [arg.strip() for arg in arg_names if arg != "self"]
            current_function = {"name": function_name, "args": arg_names, "comment": u""}
        elif current_function:
            if line.startswith('"""') or in_comment:
                if line.endswith('"""'):
                    in_comment = False
                else:
                    in_comment = True
                current_function["comment"] += line.replace('"""', "").replace("\\n", "");
            else:
                functions.append(current_function)
                current_function = None
                in_comment = False
    return functions


def inspect_images_service(request):
    """ Returns a JSON containing all functions found in the IMAGES_SERVICE_URL file
        with the corresponding comment, if available.
    """
    results = {"module": "client_images_service", "results": get_images_service_methods()}
    return JsonResponse(results)


def validate_code(request):
    """ Validates the analysis function code:
        - checks if the function is properly defined and takes two arguments
        - checks if the function returns a boolean value
    """
    errors = []
    code = request.GET.get("code", None)
    code = json.loads(code)
    #functions = get_images_service_methods()
    analysis_def = "def analysis"
    analysis_found = False
    arguments_found = False
    return_found = False
    for line in code.splitlines():
        line = line.strip()
        # check if analysis is defined
        if line.startswith(analysis_def):
            analysis_found = True
            # check if analysis takes 2 arguments
            line = line.split("(")
            if len(line) > 1:
                line = line[1].split(")")
                if len(line) > 0:
                    line = line[0].split(",")
                    if len(line) == 2:
                        arguments_found = True
            continue
        # check the return value; potential comments are ignored
        if line.startswith("return True") or line.startswith("return False"):
            return_found = True
        if analysis_found and arguments_found and return_found:
            break
    if not analysis_found:
        errors.append("Analysis function not found")
    if not arguments_found:
        errors.append("Analysis function must take exactly two arguments")
    if not return_found:
        errors.append("No return found; you must return a boolean value")
    results = {"errors": errors}
    return JsonResponse(results)
