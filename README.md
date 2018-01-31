

#  DockerAnalyser

[Department of Computer Science, University of Pisa](https://www.di.unipi.it/en/)

Author: Davide Neri.

Contact: davide.neri@di.unipi.it

## What is DockerAnalyser ?

`DockerAnalyser` is a microservice-based architecture for customizable analysis of docker images.
It permits building  custom Docker image analysers.


<!-- ## The microservice-based architecture DockerAnalyser

The figure below details the microservice-based architecture of Docker Finder. The microservice (represented as rectangles) are divided in the three three main functionalities carried out by Docker Finder:
  1. **[Analysis](https://github.com/di-unipi-socc/DockerFinder/tree/master/analysis)**: the analysis of each image consists in retrieving all the metadata already available in the registry, and in running a container to au-
tomatically extract its runtime features (e.g., the software distributions it support).
  2. **[Storage](https://github.com/di-unipi-socc/DockerFinder/tree/master/storage)**:  DockerFinder stores all produced image
descriptions in a local repository.

<div align="center">
<img src="./docs/architecture.png" width="500">
</div> -->

## Getting started
DockerAnalyser is shipped in Docker Containers and can be deployed using `Docker Compose`

The requirements are the following:

 - [**Docker engine >= 1.13**](https://docs.docker.com/engine/installation/)
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

-------------------------------------------------------------------------------
Language                     files          blank        comment           code
-------------------------------------------------------------------------------
Python                          24            461            781           1338
Markdown                         3            107              0            360
YAML                             3             34             41            226
JavaScript                       4             78            290            223
Bourne Shell                     2             41             23            206
JSON                             7              0              0             95
Dockerfile                       1              6              4              8
-------------------------------------------------------------------------------
SUM:                            44            727           1139           2456
