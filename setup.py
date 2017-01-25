from setuptools import setup, find_packages

from os import path


#here = path.abspath(path.dirname(__file__))

# Get the long description from the README file
#with open(path.join(here, 'README.rst'), encoding='utf-8') as f:
#    long_description = f.read()

setup(
    name='dockeranalyser',
    version='0.1',
    description='A tool for permiting to analyse Docker images.',
    #long_description=long_description,
    include_package_data=True,
    #packages=find_packages(),
    packages=['cli','cli.core'],
    # If there are data files included in your packages that need to be
    # installed, specify them here.  If using Python 2.6 or less, then these
    # have to be included in MANIFEST.in as well.
    package_data={
        'cli': ['config.ini'],
    },
    #package_data={'cli':['*.ini']},
    install_requires=[
        'Click',
        'GitPython'
    ],
    # Although 'package_data' is the preferred approach, in some case you may
    # need to place data files outside of your packages. See:
    # http://docs.python.org/3.4/distutils/setupscript.html#installing-additional-files # noqa
    # In this case, 'data_file' will be installed into '<sys.prefix>/my_data'
    data_files=[
        ('/home/dido/.config/dockeranalyser', ['cli/config.ini'])
        ],

    entry_points='''
        [console_scripts]
        dockeranalyser=cli.dockeranalyser:cli
    ''',
)
