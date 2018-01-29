from dockeranalyser.core.utils import pull_code
from dockeranalyser.core.mycompose import get_project, find_yml_files, ps_
from dockeranalyser.core.monitor import count_queue_msg, count_analysed_images, get_images
# from .constant import *
# import configparser
import os
import click
from . import constant
import json
import shutil

# import docker
# from git import Repo
# client = docker.from_env()

APP_NAME = "dockeranalyser"

# def get_root_project(debug=False):
#     # get_app_dir() read the deafault folder for the configuration file (~.config/dockeranalyser)
#     parser = configparser.ConfigParser()
#     cfg = ""
#     if debug:
#         return  "/home/dido/github/DockerFinder/"
#     else:
#         cfg =   os.path.join(click.get_app_dir(APP_NAME), 'config.ini')
#         parser.read(cfg)
#         return parser['project']['Root']


@click.group()
def cli():
    # print("dir analyser: " + constant.ANALYSER_CODE_DIR)
    pass


@click.command()
@click.option('-lp', '--lambda-package', default="deploy-package", help='Path to the folder that contains the lambda code and any dependencies.')
@click.option('--percentage', default=100, help="Number of images to be dowloaded form the Docker registry.")
def up(lambda_package, percentage):
    # click.echo('UP!')
    workdir = constant.ANALYSER_CODE_DIR

    if os.path.isdir(workdir):
        #click.echo("Importing the lambda package {0} into the project: {1}.".format(lambda_package, workdir))
                # if the folder target for copying the path deploy already
                # exist
        path_deploy = constant.ANALYSER_PATH_DEPLOY
        if os.path.isdir(path_deploy):
            click.echo(click.style("Lambda package {0} already exist.".format(lambda_package), fg='red'))
            if click.confirm('Do you want import the lambda package directory:{}'.format(lambda_package)):
                shutil.rmtree(path_deploy, ignore_errors=False)
                shutil.copytree(lambda_package, path_deploy)
                click.echo(click.style("Deploy package imported in: {0}".format(path_deploy), fg='green'))
        else:
            click.echo(click.style("path to deploy does not exist: {0}. ".format(path_deploy)))
            return

    else:
        click.echo(click.style("Server Code folder does not exist: {0}  ".format(workdir)))
        return


    if os.path.isdir(workdir):
        # get the yml file from the project folder
        project = get_project(workdir)
        project.up(do_build=False)
        click.echo(click.style("Docker compose up", fg='green'))
    else:
        click.echo(click.style(
            "Path to project not found. $ dockera-analyser up ", fg='red'))



#
# @click.command()
# @click.option('-d','--debug', default=False, help='Path to the folder that contains the lambda code and any dependencies.')
# def init(lambda_package, debug):
#
#     workdir =  get_root_project(debug)
#     path_deploy = workdir + "/analysis/pyFinder/pyfinder/deploy"
#
#     if not debug:
#         if os.path.isdir(workdir):
#             click.echo(click.style("Root directory already exist in: {} ".format(workdir),fg='red'))
#             if click.confirm('Do you want overwrite the root directory?'):
#                 click.echo("Deleting working directory...")
#                 shutil.rmtree(workdir, ignore_errors=False)
#                 pull_code(workdir, "https://github.com/di-unipi-socc/DockerFinder.git",  branch="dfcustom" )
#                 click.echo(click.style("Dowloaded completed",fg='green'))
#         else:
#             click.echo("Dowloading the source code in: {0}...".format(workdir))
#             pull_code(workdir, "https://github.com/di-unipi-socc/DockerFinder.git",  branch="dfcustom" )
#             click.echo(click.style("Dowloaded completed",fg='green'))
#
#         if os.path.isdir(lambda_package):
#             click.echo("Importing the lambda package {0} into the project: {1}.".format(lambda_package, workdir))
#             if os.path.isdir(path_deploy): #if the folder target for copying the path deploy already exist
#                 click.echo(click.style("Lambda package {0} already exist.".format(lambda_package), fg='red'))
#                 if click.confirm('Do you want overwrite the lambda package directory?'):
#                         click.echo("Overwriting lambda package directory...")
#                         shutil.rmtree(path_deploy, ignore_errors=False)
#                         shutil.copytree(lambda_package, path_deploy)
#                         click.echo(click.style("Deploy package imported: {0}".format(path_deploy),fg='green'))
#         else:
#             click.echo(click.style("Lambda package folder: {0}  does not exist. ".format(lambda_package)))
#     else:
#         click.echo("Debug mode: the root project {0}".format(workdir))

@click.command()
#@click.comman('--service','-s', help='Service name to build'))
def build():
    """
    docker-compose build
    """
    workdir =  constant.ANALYSER_CODE_DIR
    if os.path.isdir(workdir):
        project = get_project(workdir) # get the yml file from the project folder
        project.build(
                service_names=None
        )
        #  self.project.build(
        #     service_names=options['SERVICE'],
        #     no_cache=bool(options.get('--no-cache', False)),
        #     pull=bool(options.get('--pull', False)),
        #     force_rm=bool(options.get('--force-rm', False)))
        click.echo(click.style("Images built from Docker compose", fg='green'))
    else:
        click.echo(click.style("You must initialize the project before. $ dockeranalyser init ", fg='red'))



    #
    # return jsonify(
    #    {
    #        'command': 'up',
    #        'containers': [container.name for container in container_list]
    #    })

@click.command()
def ps():
    workdir =  constant.ANALYSER_CODE_DIR
    if os.path.isdir(workdir):
        project = get_project(workdir)
        containers =ps_(project)
        # [{
        #   'name': container.name,
        #   'name_without_project': container.name_without_project,
        #   'command': container.human_readable_command,
        #   'state': container.human_readable_state,
        #   'labels': container.labels,
        #   'ports': container.ports,
        #   'volumes': get_volumes(get_container_from_id(project.client, container.id)),
        #   'is_running': conta
        # }

        # print(containers)
        click.echo("NAME \t\t SERVICE \t\t STATE \n"+"--"*30 + "\n"+"\n".join( "{0} \t {1} \t {2}".format(c['name'],c['labels']['com.docker.compose.service'], c['state']) for c in containers))

    else:
        click.echo(click.style("You must initialize the project before. $ dockeranalyser init ", fg='red'))


@click.command()
def stop():
    # click.echo('Stopping container...')
    workdir =  constant.ANALYSER_CODE_DIR
    if os.path.isdir(workdir):
        project = get_project(workdir) # get the yml file from the project folder
        project.stop(
            # service_names = None
            )
        click.echo(click.style("Stopped all the containers", fg='green'))
    else:
        click.echo(click.style("Path to project not found. $ dockeranalyser init ", fg='red'))

@click.command()
def status():
    click.echo('Status of Docker analyser:')
    c = count_queue_msg()
    l = count_analysed_images()
    click.echo("\t\tImages in the queue: {0}".format(c))
    click.echo("\t\tImages analysed: {0}".format(l))

@click.command()
@click.option('--file', '-f', default="images.json", help="File JSON where al the images are dowloaded.")
def stash(file):

    images = get_images()
    # Writing JSON data
    with open(file, 'w') as f:
        json.dump(images, f)


@click.command()
def config():
    click.echo('Config')


# cli.add_command(init)
cli.add_command(up)
cli.add_command(build)
cli.add_command(ps)
cli.add_command(stash)
cli.add_command(stop)
cli.add_command(status)
