from git import Repo

def pull_code(local_folder, urlrepo="https://github.com/di-unipi-socc/DockerFinder.git", branch="dfcustom" ):
    """
    Downlaod the source code of the project
    """
    Repo.clone_from(urlrepo, local_folder , branch=branch, depth=1)
