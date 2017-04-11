from compose.container import Container
from compose.cli.command import get_project as compose_get_project, get_config_path_from_options, get_config_from_options
from compose.config.config import get_default_config_files
from compose.config.environment import Environment
from compose.cli.docker_client import docker_client
from compose.const import API_VERSIONS
from compose.config.config import V2_0

import fnmatch
import os

import logging


def get_project(path):
    """
    get docker project given file path
    """
    logging.debug('get project ' + path)

    environment = Environment.from_env_file(path)
    config_path = get_config_path_from_options(path, dict(), environment)
    project = compose_get_project(path, config_path)
    return project

def ps_(project):
    """
    containers status
    """
    #logging.debug('ps ' + project.name)
    containers = project.containers(stopped=True)
    items = [{
        'name': container.name,
        'name_without_project': container.name_without_project,
        'command': container.human_readable_command,
        'state': container.human_readable_state,
        'labels': container.labels,
        'ports': container.ports,
        #'volumes': get_volumes(get_container_from_id(project.client, container.id)),
        'is_running': container.is_running} for container in containers]

    return items

def find_yml_files(path):
    """
    find docker-compose.yml files in path
    """
    matches = {}
    for root, _, filenames in os.walk(path):
        for _ in fnmatch.filter(filenames, 'docker-compose.yml'):
            key = root.split('/')[-1]
            return os.path.join(os.getcwd(), root)
            #matches[key] = os.path.join(os.getcwd(), root)
    #return matches
    # """
    # matches = {}
    # for root, _, filenames in os.walk(path):
    #     for _ in fnmatch.filter(filenames, 'docker-compose.yml'):
    #         key = root.split('/')[-1]
    #         return
    #         matches[key] = os.path.join(os.getcwd(), root)
    # return matches
