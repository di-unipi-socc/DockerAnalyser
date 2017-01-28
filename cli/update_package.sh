
#!/bin/sh
rm -rf ./dist
python setup.py bdist_wheel
twine upload dist/* --skip-existing

#Pp6A4mrAjiPS
