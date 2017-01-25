import zipfile, urllib.request, shutil
import os
import click
from cli.core.utils import pull_code
from cli.core.mycompose import get_project, find_yml_files
import configparser

#import docker
#from git import Repo
#client = docker.from_env()

APP_NAME = "dockeranalyser"

def get_root_project():
    # get_app_dir() read the deafault folder for the configuration file (~.config/dockeranalyser)
    cfg = os.path.join(click.get_app_dir(APP_NAME), 'config.ini')
    parser = configparser.ConfigParser()
    parser.read(cfg)
    return parser['project']['Root']


@click.group()
def cli():
    print(get_root_project())

@click.command()
@click.option('-lp','--lambda-package', default="deploy-package", help='Path to the folder that contains the lambda code and any dependencies.')
def init(lambda_package):
    workdir =  get_root_project()
    path_deploy = workdir + "/analysis/pyFinder/pyfinder/deploy"

    if os.path.isdir(workdir):
        click.echo(click.style("Working directory already exist in: {} ".format(workdir),fg='red'))
        if click.confirm('Do you want overwrite the working directory?'):
            click.echo("Deleting working directory...")
            shutil.rmtree(workdir, ignore_errors=False)
            pull_code(workdir, "https://github.com/di-unipi-socc/DockerFinder.git",  branch="dfcustom" )
            click.echo(click.style("Dowloaded completed",fg='green'))
    else:
        click.echo("Dowloading the source code in: {0}...".format(workdir))
        pull_code(workdir, "https://github.com/di-unipi-socc/DockerFinder.git",  branch="dfcustom" )
        click.echo(click.style("Dowloaded completed",fg='green'))

    if os.path.isdir(lambda_package):
        click.echo("Importing the lambda package {0} into the project: {1}.".format(lambda_package, workdir))
        if os.path.isdir(path_deploy): #if the folder target for copying the path deploy already exist
            click.echo(click.style("Lambda package {0} already exist.".format(lambda_package), fg='red'))
            if click.confirm('Do you want overwrite the lambda package directory?'):
                    click.echo("Overwriting lambda package directory...")
                    shutil.rmtree(path_deploy, ignore_errors=False)
                    shutil.copytree(lambda_package, path_deploy)
                    click.echo(click.style("Deploy package imported: {0}".format(path_deploy),fg='green'))
    else:
        click.echo(click.style("Lambda package folder: {0}  does not exist. ".format(lambda_package)))

@click.command()
@click.pass_obj
def build(app):
    """
    docker-compose build
    """

    workdir =  get_root_project()
    if os.path.isdir(workdir):
        #matches = find_yml_files(workdir)
        #print(matches)
        project = get_project(workdir)
        project.build()
        click.echo(click.style("Images built from Docker compose", fg='green'))
    else:
        click.echo(click.style("You must initialize the project before. $ dockeranalyser init ", fg='red'))



@click.command()
@click.option('--percentage', default=100, help="Number of images to be dowloaded form the Docker registry.")
def start():
    click.echo('Start !')


@click.command()
def stop():
    click.echo('Stop!')

@click.command()
def status():
    click.echo('Status')

@click.command()
def config():
    click.echo('Config')

#
# def extract_zip(url, file_name):
#     # link for dowlaoding the zip of the dfcustom folder
#     url = "https://github.com/di-unipi-socc/DockerFinder/archive/dfcustom.zip"
#     #url = 'http://www....myzipfile.zip'
#     file_name = 'myzip.zip'
#
#     with urllib.request.urlopen(url) as response, open(file_name, 'wb') as out_file:
#         shutil.copyfileobj(response, out_file)
#         with zipfile.ZipFile(file_name) as zf:
#             print("memeber;" + zf.namelist()[0])
#             zf.extractall("DockerAnalyser", members=[zf.namelist()[0]])
#             #print(zf.namelist())




cli.add_command(init)
cli.add_command(build)
cli.add_command(start)
cli.add_command(status)
cli.add_command(config)
