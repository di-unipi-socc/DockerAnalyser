from django.http import JsonResponse
from urllib.request import urlopen
import json

SOURCE_URL = "https://raw.githubusercontent.com/di-unipi-socc/DockerAnalyser/master/analysis/scanner/scanner/core/client_images_service.py"


def get_images_service_methods():
    response = urlopen(SOURCE_URL)
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
            print(function_name, arg_names)
        elif current_function:
            if line.startswith('"""') or in_comment:
                if line.endswith('"""'):
                    in_comment = False
                else:
                    in_comment = True
                current_function["comment"] += line.replace('"""', "").replace("\\n", "");
                print("comment:", line)
            else:
                functions.append(current_function)
                current_function = None
                in_comment = False
    return functions


def inspect_images_service(request):
    results = {"module": "client_images_service", "results": get_images_service_methods()}
    return JsonResponse(results)


def validate_code(request):
    errors = []
    code = request.GET.get("code", None)
    code = json.loads(code)
    #functions = get_images_service_methods()
    analysis = "def analysis(image_json, context):"
    # def analysis(images_json, context):
    analysis_found = False
    return_found = False
    for line in code.splitlines():
        line = line.strip()
        if line.startswith(analysis):
            analysis_found = True
        if line == "return True" or line == "return False":
            return_found = True
        if analysis_found and return_found:
            break
    if not analysis_found:
        errors.append("Analysis function not found")
    if not return_found:
        errors.append("No return found")
    results = {"errors": errors}
    return JsonResponse(results)
