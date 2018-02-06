## Examples of Docker image analysers
The folder containes the **deploy packages** used to create different examples of Docker image analysers built with DockerAnalyser.


The guide assumes that the following requirements are installed in the system:
 - [**Docker engine >= 18.01.0**](https://docs.docker.com/engine/installation/)
 - [**Docker Compose >= 1.18.0**](https://docs.docker.com/compose/install/)

## Use cases
Two use cases are provided:
- `DockerFinder`: analyses each image and extracts the software versions (e.g.,`Python 2.7`, `Java 1.8`) that an image supports.

- `DockerGraph`: constructs a directed graph of images where the nodes are the repository names of images and a link from an image *s* to an image *p* is added if the image *p* is the parent image of *s*.


### Build and run DockerFinder
The `deploy-package-dockerfinder` folder contains the
- `analysis.py` is the function used to extract the software version supported by an images.
- `requirements.txt` file that contains the library dependencies of the analysis function.
- `software.json` ia a JSON file tha contains the the list of the command to be searched in the image.

Steps for building and running DockerFinder:

  1. Clone the GitHUb repository of DockerAnalyser:

  ```
  git clone https://github.com/di-unipi-socc/DockerAnalyser.git && cd DockerAnalyser
  ```
  2. Build the **scanner** microservice specifying the *deploy-package** of DockerFinder:
  ```
  docker-compose build --build-arg  DEPLOY_PACKAGE_PATH=/data/examples/deploy-package-dockerfinder scanner

  ```

  3. Start the containers:
  ```
  docker-compose up -d
  ```

Check the running containers (using **portainer** third party tool)
 - http://127.0.0.1:9000: Access the *portainer* web interface for cecking the running contianers.

Monitor the Analyser:
 - http://127.0.0.1:8082: RabbitMq web interface (User:`guest`, Password=`guest`)
 - http://127.0.0.1:3000/api/images': APIs of the `ImagesService`.

### Build and run DockerGraph
The `deploy-package-dockergraph` folder contains the
- `analysis.py` is the function used to get the *parent* image of another image by looking at the *FROM* instruction in the Dockerfile.
- `requirements.txt` file that contains the library dependencies of the analysis function.

Steps for building and running DockerFinder:

  1. Clone the GitHUb repository of DockerAnalyser:

  ```
  git clone https://github.com/di-unipi-socc/DockerAnalyser.git && cd DockerAnalyser
  ```
  2. Build the **scanner** microservice specifying the *deploy-package** of DockerFinder:
  ```
  docker-compose build --build-arg  DEPLOY_PACKAGE_PATH=/data/examples/deploy-package-dockergraph scanner

  ```

  3. Start the containers:
  ```
  docker-compose up -d
  ```
Check the running containers (using **portainer** third party tool)
 - http://127.0.0.1:9000: Access the *portainer* web interface for cecking the running contianers.

Monitor the Analyser:
 - http://127.0.0.1:8082: RabbitMq web interface (User:`guest`, Password=`guest`)
 - http://127.0.0.1:3000/api/images': APIs of the `ImagesService`.
