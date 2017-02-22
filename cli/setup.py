from setuptools import setup, find_packages
from setuptools.command.install import install as _install
from six import print_
from dockeranalyser import constant
from git import Repo
import shutil
import os

# here = path.abspath(path.dirname(__file__))
#
# # Get the long description from the README file
# with open(path.join(here, 'README.rst'), encoding='utf-8') as f:
#    long_description = f.read()

GIT_REPO_URL= constant.GIT_REPO_URL #"https://github.com/di-unipi-socc/DockerFinder.git"
GIT_REPO_BRANCH=constant.GIT_REPO_BRANCH #"dfcustom"
ANALYSER_CODE_DIR=constant.ANALYSER_CODE_DIR  #"/opt/DockerAnalyser"

class install(_install):
    def run(self):
        _install.run(self)
        self.pull_code()
        print_("Analyser Root directory: {0}".format(ANALYSER_CODE_DIR))

    def pull_code(self):
        print_("pulling the code")
        if os.path.isdir(ANALYSER_CODE_DIR):
            print_("Root directory already exist in: {} ".format(ANALYSER_CODE_DIR))
            #if input('Do you want overwrite the root directory? [y/n]') == 'y':
            shutil.rmtree(ANALYSER_CODE_DIR, ignore_errors=False)
            print_("Removed directory in: {} ".format(ANALYSER_CODE_DIR))
            #Repo.clone_from(GIT_REPO_URL, ANALYSER_CODE_DIR , branch="dfcustom", depth=1)
            #print_("Dowloaded completed")
        #else:
        print_("Dowloading the Analyser server code in: {0}...".format(ANALYSER_CODE_DIR))
        Repo.clone_from(GIT_REPO_URL, ANALYSER_CODE_DIR , branch=GIT_REPO_BRANCH, depth=1)
        print_("Dowloaded completed")

setup(
    name='DockerAnalyser',
    version='0.2.1',
    description='Analyse Docker images.',
    cmdclass={'install': install},
    #long_description=long_description,
    include_package_data=True,
    packages=find_packages(),

    #packages=['cli','cli.core'],
    # If there are data files included in your packages that need to be
    # installed, specify them here.  If using Python 2.6 or less, then these
    # have to be included in MANIFEST.in as well.
    package_data={
        'dockeranalyser': ['config.ini'],
    },
    #package_data={'cli':['*.ini']},
    install_requires=[
        'Click',
        'GitPython',
        'docker-compose',
        'pika',
        'six',
    ],
    # Although 'package_data' is the preferred approach, in some case you may
    # need to place data files outside of your packages. See:
    # http://docs.python.org/3.4/distutils/setupscript.html#installing-additional-files # noqa
    # In this case, 'data_file' will be installed into '<sys.prefix>/my_data'
    data_files=[
        ('/home/dido/.config/dockeranalyser', ['dockeranalyser/config.ini'])
    ],

    entry_points='''
        [console_scripts]
        docker-analyser=dockeranalyser.shell:cli
    ''',
)
