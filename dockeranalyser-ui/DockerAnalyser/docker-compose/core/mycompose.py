from compose.cli.main import TopLevelCommand
from compose.project import OneOffFilter
from compose.cli.command import project_from_options

from os import path
import json
import yaml
import io
from itertools import groupby
from operator import attrgetter

def singleton(theClass):
    """ decorator for a class to make a singleton out of it """
    classInstances = {}

    def getInstance(*args, **kwargs):
        """ creating or just return the one and only class instance.
            The singleton depends on the parameters used in __init__ """
        key = (theClass, args, str(kwargs))
        if key not in classInstances:
            classInstances[key] = theClass(*args, **kwargs)
        return classInstances[key]

    return getInstance


@singleton
class MyCompose:

    def __init__(self, project_name, project_dir='.', file_compose='docker-compose.yml'):
        self._name = project_name
        self.file = file_compose
        self.project_dir = project_dir
        print("Reading file: {}".format(self.get_compose_file()))
        # TODO: get project must be called every time in order to load  the compose file updated
        self._project = self._get_project(project_dir, project_name=self._name)
        self.compose = TopLevelCommand(self._project, project_dir=project_dir)

    def reload_project(self):
        self._project = self._get_project(self.project_dir, project_name=self._name)
        self.compose = TopLevelCommand(self._project, project_dir=self.project_dir )


    def get_compose_file(self):
        return path.join(self.project_dir, self.file)

    def get_name(self):
        return self._name

    def get_service_names(self):
        return self._project.service_names


    def build(self, services=None):
        services = services if services else self.get_service_names()
        services_no_scanner = list(filter(lambda x: x != "scanner", services))
        self.compose.build({'SERVICE': services_no_scanner, '--memory': '1GB'})

    def build_scanner(self, scanner_name='scanner', path_deploypackage='/data/examples/deploy-package-dockerfinder'):
        print("Building the scanner....")
        self.compose.build({'SERVICE': [scanner_name],
                            '--build-arg': {
                            "DEPLOY_PACKAGE_PATH": path_deploypackage
        },
            '--memory': '1GB'})
        print("Finished building")

    def up(self, services=None, scale=None):
        # scale = ['crawler=2']
        # services =  list of services
        print(scale)
        services = services if services else self.get_service_names()
        scale = scale if scale else []
        options = {
            'SERVICE': services,
            'start': True,
            '--no-deps': False,
            '--always-recreate-deps': False,
            '--abort-on-container-exit': None,
            '--remove-orphans': False,
            '--detach': True,
            '--no-start': False,
            '--no-recreate': False,
            '--force-recreate': True,
            '--no-build': False,
            '--build': False,
            '--scale': [scale] if scale else []  # ['crawler=2']
        }
        self.compose.up(options)
        return (services, scale)

    def run(self, service_name='crawler', command='crawl', args=['--fp=100', '--min-pulls=10', '--min-stars=20', '--policy=pulls_first']):
        options = {'SERVICE': service_name,
                   'COMMAND': command,
                   'ARGS': args,
                   "--no-deps": True,
                   '-e': None, '--label': None, '--rm': True, '--user': None,
                   '--name': None, '--workdir': None, '--volume': None,
                   '--publish': False, '--detach': True, "--service-ports": False,
                   "--use-aliases": True,
                   '--entrypoint': None}
        return self.compose.run(options)

    def stop(self, services):
        services = [services] if services else self.get_service_names()
        self.compose.stop({'SERVICE': services})
        return self.get_service_names()

    def ps(self, services=None):
        """
        services status
        """
        # running_containers = self._project.containers(stopped=False)
        services_name = [services] if services else self.get_service_names()
        running_containers = self._project.containers(
            service_names=services_name, stopped=True)

        items = [{
            'name': container.name,
            'service': container.service,
            'name_without_project': container.name_without_project,
            'command': container.human_readable_command,
            'state': container.human_readable_state,
            'health': container.human_readable_health_status,
            # 'labels': container.labels,
            'ports': container.human_readable_ports,
            # 'volumes': get_volumes(get_container_from_id(project.client, container.id)),
            'log': container.log_config,
            'is_running': container.is_running} for container in running_containers]

        service_per_container = list()
        for key, group in groupby(items, lambda x: x['service']):
            l = list(group)
            service_per_container.append({'name': key,
                                          'num': len(l),
                                          'containers': l,
                                          })

        return service_per_container

    def logs(self, services=None, tail=4):
        services_logs = []
        containers = self._project.containers(
            service_names=services if services else self.get_service_names(), stopped=True)
        for container in containers:
            logs = dict()
            logs['name'] = container.name
            logs['service'] = container.service
            print(tail)
            logs['log'] = container.logs(tail=tail).decode("utf-8")
            services_logs.append(logs)
        return services_logs

    def _get_project(self, path, project_name=None):
        """
        get docker project given file path
        """
        # environment = Environment.from_env_file(path)
        # config_path = get_config_path_from_options(path, dict(), environment)
        # project = compose_get_project(path, config_path, project_name=project_name)
        options = {
            '--file': [self.file],
            '--host': None,
            '--project-name': project_name,
            '--verbose': False,
            '--project-directory': None,  # override the path of the project
            '--compatibility': False
        }
        project = project_from_options(path, options)
        return project

    def get_config(self, service=None, key='command'):
        with open(self.get_compose_file(), 'r+') as file_compose:
            data = yaml.load(file_compose)
        if (service):
            # list ['command','args=value', 'arg2=value2']
            return data['services'][service][key]
        else:
            return data['services']

    def config_command(self, service, command=None, args=None):
        try:
            with open(self.get_compose_file(), 'r+') as file_compose:
                data = yaml.load(file_compose)
                # list ['command','args=value', 'arg2=value2']
                actual_command_args = data['services'][service]['command']
                actual_command = actual_command_args[0]
                actual_args = actual_command_args[0]
                data['services'][service]['command'] = [
                    command if command else actual_command] + (args if args else actual_args)
                file_compose.seek(0)  # rewind
                yaml.dump(data, file_compose, indent=4)
                file_compose.truncate()
            self.reload_project()
            return True
        except:
            return False
