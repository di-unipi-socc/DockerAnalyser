# DockerAnalyserUI

User interface for DockerAnalyser.

## Backend Setup

Create and activate virtualenv:
```sh
virtualenv -p python3 backend
cd backend
source bin/activate
```

Install dependecies:
```sh
pip install --upgrade pip
pip install -r requirements.txt
```

Setup Django:
```sh
cd dockeranalyser
python manage.py migrate
```

Collect the frontend static files:
```sh
python manage.py collectstatic --noinput
```

Start Django:
```sh
python manage.py runserver
```

## Frontend Setup
Frontend source code is located in this folder: backend/dockeranalyser/frontend/
To try it, just open index.html: static/dist folder already contains compiled js files.

To see it served by django, make sure to update it to the last version with:
```sh
python manage.py collectstatic --noinput
```
Then, when backend is running, go to http://localhost:8000


To edit, first install dependecies:
```sh
cd frontend
npm install
```

Edit files, then:
```sh
npm run build
```
Or, to auto-build after each save:
```sh
npm run watch
```
This will use Webpack to build a single .js file in the static/dist folder, containing all the source code and the dependencies code. Webpack will also take care to compile .scss files and include them in the final build.

Generate documentation with:
```sh
jsdoc -r -c jsdoc-conf.json -d docs
```
This will generate the HTML fontend documentation in the backend/dockeranalyser/frontend/docs folder