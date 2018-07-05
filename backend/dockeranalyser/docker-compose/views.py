import json
import zipfile
import sys
import traceback
import os.path
import compose
from shutil import make_archive
import shutil
import datetime
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import HttpResponse
from django.http import JsonResponse
from distlib.index import PackageIndex
from wsgiref.util import FileWrapper
from django.core.files.storage import FileSystemStorage
from django.conf import settings
from .core import utils
from .core.mycompose import MyCompose

# PROJECT_DIR = "/home/dido/code/DockerAnalyserUI/DockerAnalyser/"
# PATH_TOSAVE_DEPLOY_PACKAGE = "{}/data/examples".format(PROJECT_DIR)
# DEFAULT_DEPLOY_PACKAGE = "default-deploy-package"

PROJECT_NAME = "docker-analyser"

mycompose = MyCompose(project_name=PROJECT_NAME,project_dir=settings.DOCKER_ANALYSER_DIR)

@csrf_exempt
def upload(request):
    #mycompose = MyCompose(project_name=PROJECT_NAME,project_dir=settings.DOCKER_ANALYSER_DIR)
    key = "deploy-package"
    if request.method == 'POST':
        # POST /upload:
        #    deploy-package : DEPLOY-PACKAGE.zip
        if key not in request.FILES:
            return JsonResponse({"err": 0, "msg": "NO {} key set into body request".format(key), "detail": ""})
        uploaded_file = request.FILES[key]  # deploy-pacakge: .zip file
        files_extracted = handle_uploaded_deploy_package(uploaded_file)
        if not files_extracted:
            options = "Name:{} \t Bytes:{} \t Content-type:{}".format(
                uploaded_file.name, uploaded_file.size, uploaded_file.content_type)
            return JsonResponse({"err": 1, "msg": "{} upload file is empty".format(uploaded_file.name), "detail": options})
        else:
            return JsonResponse(utils.success_msg("{} sucesfully extracted".format(uploaded_file.name),
                                                files_extracted))
    if request.method == 'GET':
        """
        Return the latest uploaded zip file.
        If the latest is missing, it resturn the zip file containing the default
        deploy package.
        """
        path_to_zip = get_zip_deploy_package()
        with open(path_to_zip, 'rb') as file_zip:
            print("Open file zip {}".format(file_zip.name))
            response = HttpResponse(FileWrapper(
                file_zip), content_type='application/zip')
            response['Content-Disposition'] = 'attachment; filename={}'.format(
                os.path.basename(file_zip.name))  # +file_name.replace(" ","_")+'.zip'
            response['Access-Control-Expose-Headers'] = 'Content-Disposition'
        return response


def build(request):
    #
    #mycompose = MyCompose(project_name=PROJECT_NAME,project_dir=settings.DOCKER_ANALYSER_DIR)
    # GET  /build
    # Build the scanner with the deploy-package uploaded.
    if request.method == 'GET':

        try:
            mycompose.build() # build the services aprt scanner
            deploy_package = get_latest_uploaded_deploy_package()
            path = os.path.join(settings.DOCKER_ANALYSER_RELATIVE_PATH_DEPLOY_PACKAGE,deploy_package)
            res = mycompose.build_scanner(scanner_name="scanner",path_deploypackage=path)
            msg = utils.success_msg("{} DockerAnalyser built succesfuly. Selected deploy package: {}"
                                    .format(mycompose.get_name(),deploy_package))
            return JsonResponse(msg)
        except compose.service.BuildError as err:
            return JsonResponse({"err": 1,
                                 "msg": "{} DockerAnalyser not built. Error occurs when building with {}".format(mycompose.get_name(), deploy_package),
                                 "detail": str(err)
                                 })
        except Exception as e:
            return JsonResponse({"err": 1, "msg": traceback.format_exc()})



def up(request):
    # GET /up?service=<SERVICE_NAME>&scale=<NUM>
    #mycompose = MyCompose(project_name=PROJECT_NAME,project_dir=settings.DOCKER_ANALYSER_DIR)
    service = request.GET.get('service')
    scale = request.GET.get('scale')
    try:
        (services_up, scale) = mycompose.up(services=([service] if service else None), scale=(
            "{}={}".format(service, scale) if scale else None))  # service_names=["scanner"]
        return JsonResponse({"err": 0,
                             "msg": "DockerAnalyser UP succesfully.",
                             "detail": "services:{} scale {} ".format(services_up, scale)})
    except Exception as e:
        return JsonResponse({"err": 1, "msg": traceback.format_exc()})


@csrf_exempt
def config(request):
    #mycompose = MyCompose(project_name=PROJECT_NAME,project_dir=settings.DOCKER_ANALYSER_DIR)
    # POST /config
    # body:
       # {
       #  "service": "crawler",
       #  "command": "crawl",
       #  "args": {
       #          "force-page":true,
       #          "si": 0,
       #          "random": false,
       #          "fp": 10,
       #          "ps": 0,
       #          "policy": "pulls_first",
       #          "min-stars" : 0,
       #          "min-pulls" : 0,
       #          "only-automated": true,
       #          "only-official": false
       #      }
       #  }
    if request.method == 'POST':
        if request.body:
            body = json.loads(request.body)
            service = body['service']
            command = body['command']
            user_args = body['args']
            crawler_default_args = ["--save-url=/data/crawler/lasturl.txt",
                                    "--amqp-url=amqp://guest:guest@rabbitmq:5672",
                                    "--images-url=http://images_server:4000/api/images/",
                                    "--queue=images"]

            map_args = {"si": "--si", "force-page": "--force-page", "random": "--random",
                        "fp": "--fp", "ps": "--ps", "policy": "--policy",
                        "min-stars": "--min-stars", "min-pulls": "--min-pulls",
                        "only-automated": "--only-automated",
                        "only-official": "--only-official"}


            crawler_user_args = [
                "{}={}".format(map_args[k], str(v)) for k, v in user_args.items() if  (k not in [
                'only-automated', 'only-official']) ]
            if(user_args['only-automated']):
                crawler_user_args.append(map_args['only-automated'])
            if(user_args['only-official']):
                crawler_user_args.append(map_args['only-official'])
            args = crawler_default_args + crawler_user_args
            try:
                mycompose.config_command(service, command, args)
                return JsonResponse(utils.success_msg(
                                    "{} configured succesfully".format(
                                        service),
                                    [command]+args))
            except Exception as e:
                return JsonResponse({"err": 1, "msg": traceback.format_exc()})
    if request.method == 'GET':
        # GET  /config?service=<NAME>
        service = request.GET.get('service')
        res = mycompose.get_config(service if service else None, key="command")
        return JsonResponse(
            utils.success_msg(
                "{} configuration options".format(
                    service if service else "All the services"),
                res))


def logs(request):
    #mycompose = MyCompose(project_name=PROJECT_NAME,project_dir=settings.DOCKER_ANALYSER_DIR)
    # GET /logs?service=<SERVICE_NAME>
    # #mycompose = MyCompose(project_name=PROJECT_NAME, project_dir=PROJECT_DIR)
    service = request.GET.get('service')
    tail = request.GET.get('tail')
    res = mycompose.logs(services=[service] if service else None, tail=int(tail) if tail else 10)
    return JsonResponse({"err": 0, "msg": "Logs of services", "services": res})


def stop(request):
    # mycompose = MyCompose(project_name=PROJECT_NAME,project_dir=settings.DOCKER_ANALYSER_DIR)
    # GET /stop
    service = request.GET.get('service')
    try:
        services = mycompose.stop(services=service)  # service_names=["scanner"]
        return JsonResponse({"err": 0, "msg": "stop {} services".format(service)})
    except Exception as e:
        return JsonResponse({"err": 1, "msg": traceback.format_exc()})


def status(request):
    # mycompose = MyCompose(project_name=PROJECT_NAME,project_dir=settings.DOCKER_ANALYSER_DIR)
    # GET /status
    service = request.GET.get('service')
    try:
        services = mycompose.ps(services=service)
        if(service):
            return JsonResponse({"err": 0, "msg": "Status of {}".format(service),
                                "replicas": len(services), "services": services}, safe=False)
        else:
            return JsonResponse({"err": 0, "msg": "status of the services", "services": services}, safe=False)

    except Exception as e:
        return JsonResponse({"err": 1, "msg": traceback.format_exc()})


def exist_uploaded_deploy_package():
    fs = FileSystemStorage()
    directories, files = fs.listdir(settings.MEDIA_ROOT)
    print("Directories {} Files: {}".format(directories, files))
    return len(directories) > 0#ettings.UPLOADED_DEPLOY_PACKAGE in directories

def _extract_zip_file(file, path_folder):
    filenames_extracted = []
    print("Extracting {} into {}".format(file.name,path_folder))
    with zipfile.ZipFile(file, "r") as zip_ref:
        zip_ref.printdir()
        zip_ref.extractall(path_folder)
        filenames_extracted = [zip.filename for zip in zip_ref.infolist()]
    return filenames_extracted #[0], filenames_extracted[1:]


def get_zip_deploy_package():
    print("Getting deploy package")
    name_deploy_package = ""
    if exist_uploaded_deploy_package():
        name_deploy_package = get_latest_uploaded_deploy_package()
    else:
        name_deploy_package = settings.DEFAULT_DEPLOY_PACKAGE
        shutil.copytree(os.path.join(settings.DOCKER_ANALYSER_EXAMPLES,settings.DEFAULT_DEPLOY_PACKAGE),
                        os.path.join(settings.MEDIA_ROOT,settings.DEFAULT_DEPLOY_PACKAGE))
        shutil.copytree(os.path.join(settings.DOCKER_ANALYSER_EXAMPLES,settings.DEFAULT_DEPLOY_PACKAGE),
                        os.path.join(settings.DOCKER_ANALYSER_PATH_DEPLOY_PACKAGE,settings.DEFAULT_DEPLOY_PACKAGE))
    file_path = os.path.join(settings.MEDIA_ROOT,name_deploy_package)
    path_to_zip = make_archive(file_path, "zip", file_path)
    return path_to_zip

def get_deploy_packages_name():
    fs = FileSystemStorage()
    directories, files = fs.listdir(settings.MEDIA_ROOT)
    dir_creation_time = [(fs.get_created_time(directory),directory) for directory in directories]
    dir_creation_time.sort(key=lambda tup: tup[0], reverse=True)
    uploaded_package = [d[1] for d in dir_creation_time]
    return uploaded_package

def get_latest_uploaded_deploy_package():
    dp = get_deploy_packages_name()
    return dp[0]

def handle_uploaded_deploy_package(uploaded_file):
    date_upload = datetime.datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
    # copy to /data/examples in DockerAnalyser
    # TODO: remove this copy when UI is inserted into DockerAnalyser because
    # the scanner will be built by looking in the media folder directly.
    path = os.path.join(settings.DOCKER_ANALYSER_PATH_DEPLOY_PACKAGE) #,date_upload+settings.UPLOADED_DEPLOY_PACKAGE)
    files_extracted = _extract_zip_file(uploaded_file,path_folder=path)
    # copy to /media
    path_media = os.path.join(settings.MEDIA_ROOT)#,date_upload+settings.UPLOADED_DEPLOY_PACKAGE)
    files_extracted = _extract_zip_file(uploaded_file,path_folder=path_media)
    return files_extracted
