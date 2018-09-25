from django.conf import settings
from django.http import JsonResponse
from django.http import HttpResponse
from wsgiref.util import FileWrapper
from urllib.request import urlopen
from io import StringIO
from datetime import datetime
import urllib.parse
import json
import zipfile
import os

images_service_url = settings.IMAGES_SERVER_URL + "/api/images"
images_search_url = settings.IMAGES_SERVER_URL + "/search"
images_stats_url = settings.IMAGES_SERVER_URL + "/stats/"
images_drop_url = images_service_url + "/drop"
images_export_url = images_service_url + "/export"

server_down_msg = "Image Server is down"


def get_params(request):
    """ Gets parameters from the request and returns them 
        and their values in a dictionary.
    """
    data = {}
    for key in request.GET.keys():
        if key != '_':  # Fix for pagination.js plugin
            data[key] = request.GET.get(key, None)
    return data


def make_request(url, params):
    """ Acts as a proxy for the Images Server.
        Given a url and the parameters dict, 
        makes the request to the server and returns the JSON response.
    """
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    try:
        response = urlopen(url)
    except:
        return JsonResponse({"err": 1, "msg": server_down_msg})
    content = response.read().decode("utf-8")
    content = json.loads(content)
    return JsonResponse(content)


def images_list(request):
    """ Returns all analysed images."""
    params = get_params(request)
    return make_request(images_service_url, params)


def images_search(request):
    """ Performs a search within the analysed images."""
    params = get_params(request)
    return make_request(images_search_url, params)


def images_stats(request):
    """ Returns the stats for a specific attribute."""
    attribute = request.GET.get("attribute", None)
    url = images_stats_url + attribute
    return make_request(url, None)


def images_drop(request):
    """ Removes all analysed images."""
    return make_request(images_drop_url, None)


def images_export(request):
    """ Gets the full JSON export of the analysed images and returns it
        to the user inside a zip file, named including the current date and time.
    """
    now = datetime.now()
    base_filename = "docker-analyser-images-" + now.strftime("%Y%m%d-%H%M%S")
    json_filename = base_filename + ".json"
    zip_filename = base_filename + ".zip"
    try:
        export = urlopen(images_export_url)
    except:
        return JsonResponse({"err": 1, "msg": server_down_msg})
    content = export.read().decode("utf-8")
    tmp = open(json_filename, "w")
    tmp.write(content)
    tmp.close()
    zip = zipfile.ZipFile(zip_filename, mode="w", compression=zipfile.ZIP_DEFLATED)
    zip.write(json_filename)
    zip.close()
    file_zip = open(zip_filename, "rb")
    response = HttpResponse(FileWrapper(file_zip), content_type="application/zip")
    response["Content-Disposition"] = "attachment; filename=" + zip_filename
    response["Access-Control-Expose-Headers"] = "Content-Disposition"
    os.remove(json_filename)
    os.remove(zip_filename)
    return response
