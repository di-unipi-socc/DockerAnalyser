The requirements are the following:

 - [**Docker engine >= 18.01.0-ce**](https://docs.docker.com/engine/installation/)
 - [**Docker Compose >= 1.12.0**](https://docs.docker.com/compose/install/)

 Two use cases are already available
 - `DockerGraph`: constructs a Knowledge base representing a directed graph of the dependencies among the repository name in Docker Hub.
 - `DockerFinder`: permits to search the images based on the software distribution that are supported (e.g., search the images that support `Python 2.7`)

### Deploy DockerFinder
The `deploy-package-dockerfinder`  folder contains the analysis function of 'docker-finder'.

In ordet to build `scanner` microservice running the analysis function of `DockerFinder`:
```
$ docker-compose build --build-arg  deploy=deploy-package-dockerfinder scanner

```
Deploy all the microservices:
```
$ docker-compose up
```

### Deploy DockerGraph
The `deploy-package-dockergraph` in the `analysis` folder contains the analysis function of
`DockerGraph`.

How to build the `scanner` microservice running the analysis function of `DockerGraph`:
```
$ docker-compose build --build-arg  deploy=deploy-package-dockergraph scanner

```

Deploy all the microservices:
```
$ docker-compose up
```
