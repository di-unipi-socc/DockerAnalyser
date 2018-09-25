import logging
from os.path import normpath
# from compose import __version__ as compose_version
from compose.container import Container
from compose.cli.utils import get_version_info
from compose.cli.command import get_project as compose_get_project, get_config_path_from_options, get_config_from_options
from compose.config.config import get_default_config_files
from compose.config.environment import Environment
from compose.cli.main import TopLevelCommand
from compose.cli.docker_client import docker_client
from compose.const import API_VERSIONS, COMPOSEFILE_V3_0

logging.info(get_version_info('full'))

def ps_(project):
    """
    containers status
    """
    logging.info('ps ' + project.name)
    running_containers = project.containers(stopped=True)

    items = [{
        'name': container.name,
        'name_without_project': container.name_without_project,
        'command': container.human_readable_command,
        'state': container.human_readable_state,
        'labels': container.labels,
        'ports': container.ports,
        'volumes': get_volumes(get_container_from_id(project.client, container.id)),
        'is_running': container.is_running} for container in running_containers]

    return items

def run(project,service,command, options):
    # Run a service passing the command OPTIONS
    # e.g.
    #     docker-compose run crawler crawl --fp=100 --min-pulls=10  --min-stars=20
    #       SERVICE = crawler
    #       COMMAND = crawl
    #       OPTIONS =  --fp=100 --min-pulls=10  --min-stars=20
    service = "crawler"
    service = self.project.get_service(service) #options['SERVICE'])
    # detach = options.get('--detach')
    #
    # if options['--publish'] and options['--service-ports']:
    #     raise UserError(
    #         'Service port mapping and manual port mapping '
    #         'can not be used together'
    #     )

    # if options['COMMAND'] is not None:
    #     command = [options['COMMAND']] + options['ARGS']
    # elif options['--entrypoint'] is not None:
    #     command = []
    # else:
    #     command = service.options.get('command')

    command = "--fp=100 --min-pulls=10  --min-stars=20"

    container_options = None # build_container_options(options, detach, command)
    run_one_off_container(
        container_options, self.project, service, options,
        self.toplevel_options, self.project_dir
    )


def get_container_from_id(my_docker_client, container_id):
    """
    return the docker container from a given id
    """
    return Container.from_id(my_docker_client, container_id)

def get_volumes(container):
    """
    retrieve container volumes details
    """
    mounts = container.get('Mounts')
    return [dict(source=mount['Source'], destination=mount['Destination']) for mount in mounts]


def get_yml_path(path):
    """
    get path of docker-compose.yml file
    """
    return get_default_config_files(path)[0]

def get_project(path, project_name=None):
    """
    get docker project given file path
    """
    logging.debug('get project ' + path)

    environment = Environment.from_env_file(path)
    config_path = get_config_path_from_options(path, dict(), environment)
    project = compose_get_project(path, config_path, project_name=project_name)
    return project

def containers():
    """
    active containers
    """
    return client().containers()

def info():
    """
    docker info
    """
    docker_info = client().info()
    return dict(compose=compose_version,info=docker_info['ServerVersion'], name=docker_info['Name'])

def client():
    """
    docker client
    """
    return docker_client(Environment(), API_VERSIONS[COMPOSEFILE_V3_0])

def project_config(path):
    """
    docker-compose config
    """
    norm_path = normpath(path)
    return get_config_from_options(norm_path, dict())


if __name__ == "__main__":
    project_dir="/home/dido/code/DockerAnalyserUI/DockerAnalyser/"
    project = get_project(project_dir, project_name="docker-finder")
    # # docker-compose build --build-arg  DEPLOY_PACKAGE_PATH=/data/examples/deploy-package-dockerfinder scanner
    # d = project.build(service_names=["scanner"], build_args={"DEPLOY_PACKAGE_PATH": "/data/examples/deploy-package-dockerfinder"})
    #
    # # service_names=None, no_cache=False, pull=False, force_rm=False, memory=None, build_args=None, gzip=False):
    # containers = project.up() # service_names=["scanner"]
    # c = [ str(d) for i in containers]
    # print(c)
    #
    # project.stop()
    topcommand = TopLevelCommand(project, project_dir=project_dir)
    # tart_deps = not options['--no-deps']
    #     always_recreate_deps = options['--always-recreate-deps']
    #     exit_value_from = exitval_from_opts(options, self.project)
    #     cascade_stop = options['--abort-on-container-exit']
    #     service_names = options['SERVICE']
    #     timeout = timeout_from_opts(options)
    #     remove_orphans = options['--remove-orphans']
    #     detached = options.get('--detach')
    #     no_start = options.get('--no-start')
    # topcommand.build({'SERVICE':['scanner'],
    #                 '--build-arg': {
    #                         "DEPLOY_PACKAGE_PATH": "/data/examples/deploy-package-dockerfinder"
    #                         },
    #                 '--memory':'1GB'
    #                     }
    #
    # )
    # topcommand.up()
    # topcommand.run({'SERVICE':'crawler',
    #                 'COMMAND':'crawl',
    #                 'ARGS':['--fp=100', '--min-pulls=10','--min-stars=20', '--policy=pulls_first'],
    #                 "--no-deps":True,
    #                 '-e':None,'--label':None,'--rm':True,'--user':None,
    #                 '--name':None,'--workdir':None,'--volume':None,
    #                 '--publish':False,'--detach':True,"--service-ports":False,
    #                  "--use-aliases":None,
    #                 '--entrypoint':None})
    # topcommand.stop({'SERVICS':'scanner'})
    m ''
