from compose.cli.command import get_project as compose_get_project, get_config_path_from_options, get_config_from_options
from compose.cli.command import project_from_options
from compose.config.environment import Environment

# def pull_code(local_folder, urlrepo="https://github.com/di-unipi-socc/DockerFinder.git", branch="dfcustom" ):
#     """
#     Downlaod the source code of the project
#     """
#     Repo.clone_from(urlrepo, local_folder , branch=branch, depth=1)


def get_project(path, project_name=None):
    """
    get docker project given file path
    """
    # environment = Environment.from_env_file(path)
    # config_path = get_config_path_from_options(path, dict(), environment)
    # project = compose_get_project(path, config_path, project_name=project_name)
    options = {
        '--file': ['docker-compose.json'],
        '--host': None,
        '--project-name': project_name,
        '--verbose': False,
        '--project-directory': None,  # override the path of the project
        '--compatibility': False
    }
    project = project_from_options(path, options)
    return project


def success_msg(msg, detail=None):
    return {"err": 0, "msg": msg, "detail": "{}".format(detail)}
