#GIT_REPO_URL= "https://github.com/di-unipi-socc/DockerFinder.git"
from os.path import expanduser
home = expanduser("~") # it works on windows and linux

GIT_REPO_URL="git@github.com:di-unipi-socc/DockerLambdaAnalyser.git"
GIT_REPO_BRANCH="master"
ANALYSER_CODE_DIR=home+"/DockerAnalyser"
ANALYSER_PATH_DEPLOY=ANALYSER_CODE_DIR+"/analysis/pyFinder/pyfinder/deploy"
