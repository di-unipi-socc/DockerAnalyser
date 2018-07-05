from django.http import JsonResponse
from distlib.index import PackageIndex
import json


def search_package(request):
    name = request.GET.get("name", None)
    if not name:
        return JsonResponse({"error": "Please provide a name to search"})

    search_params = {"name": name}
    version = request.GET.get("version", None)
    if version:
        search_params["version"] = version

    index = PackageIndex()
    search_results = index.search(search_params)
    results = {"search": name, "results": []}
    for item in search_results:
        results["results"].append(item)

    return JsonResponse(results)


def validate_requirements(request):
    reqs = request.GET.get("requirements", None)
    reqs = json.loads(reqs)
    index = PackageIndex()
    results = {"errors": []}
    for req in reqs:
        name = req["name"]
        version = req["version"]
        search_params = {"name": name, "version": version}
        search_results = index.search(search_params)
        if len(search_results) == 0:
            results["errors"].append(name)
    return JsonResponse(results)
