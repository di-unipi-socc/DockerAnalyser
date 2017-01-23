import os
from git import Repo
import fnmatch

def pull_code(local_folder, urlrepo="https://github.com/di-unipi-socc/DockerFinder.git", branch="dfcustom" ):
    """
    Downlaod the source code of the project
    """
    Repo.clone_from(urlrepo, local_folder , branch=branch, depth=1)


def find_compose_yml(path):
    """
    find docker-compose.yml file in path
    """
    #matches = {}
    for root, _, filenames in os.walk(path):
        for _ in fnmatch.filter(filenames, 'docker-compose.yml'):
            #key = root.split('/')[-1]
            #matches[key] = os.path.join(os.getcwd(), root)
            return os.path.join(os.getcwd(), root)
    #return matches
