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


def get_params(request):
    data = {}
    for key in request.GET.keys():
        data[key] = request.GET.get(key, None)
    return data


def make_request(url, params):
    if params:
        url = url + "?" + urllib.parse.urlencode(params)
    response = urlopen(url)
    content = response.read().decode("utf-8")
    content = json.loads(content)
    return JsonResponse(content)


def images_list(request):
    params = get_params(request)
    return make_request(images_service_url, params)


def images_search(request):
    params = get_params(request)
    return make_request(images_search_url, params)


def images_stats(request):
    attribute = request.GET.get("attribute", None)
    url = images_stats_url + attribute
    return make_request(url, None)


def images_drop(request):
    return make_request(images_drop_url, None)


def images_export(request):
    now = datetime.now()
    base_filename = "docker-analyser-images-" + now.strftime("%Y%m%d-%H%M%S")
    json_filename = base_filename + ".json"
    zip_filename = base_filename + ".zip"
    export = urlopen(images_export_url)
    content = export.read().decode("utf-8")
    tmp = open(json_filename, "w")
    tmp.write(content)
    tmp.close()
    zip = zipfile.ZipFile(zip_filename, mode="w", compression=zipfile.ZIP_DEFLATED)
    zip.write(json_filename)
    zip.close()
    file_zip = open(zip_filename, "rb")
    #json_file = StringIO()
    #json_file.write(content)
    #json_file.seek(0)
    response = HttpResponse(FileWrapper(file_zip), content_type="application/zip")
    response["Content-Disposition"] = "attachment; filename=" + zip_filename
    response["Access-Control-Expose-Headers"] = "Content-Disposition"
    #headers = export.getheaders()
    #for header in headers:
    #    if header[0] in ['Content-Disposition', 'Content-Type']:
    #        response[header[0]] = header[1]
    os.remove(json_filename)
    os.remove(zip_filename)
    return response
