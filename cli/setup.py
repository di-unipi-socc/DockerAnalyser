from setuptools import setup

setup(
    name='dockeranalyser',
    version='0.1',
    py_modules=['dockeranalyser'],
    install_requires=[
        'Click',
        'GitPython'
    ],
    entry_points='''
        [console_scripts]
        dockeranalyser=dockeranalyser:cli
    ''',
)
