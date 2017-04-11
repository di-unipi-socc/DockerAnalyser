
#!/bin/sh
rm -rf ./dist
python setup.py bdist_wheel
twine register  dist/DockerAnalyser-0.2.1-py2.py3-none-any.whl
twine upload dist/* --skip-existing

#Pp6A4mrAjiPS
