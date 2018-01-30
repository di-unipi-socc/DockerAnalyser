

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

<!--
## DockerFinder deployments
The microservice-based architecture of Docker Finder is
deployed as a multi-container Docker application (figure)  Each service is shippend within a Docker image (represented as boxes) and the protocol communications are represented as dashed lines (e.g. HTTP, AMQP, mongodb).
>>>>>>> master

<div align="center">
<img src="./docs/architecture_docker.png" width="500">
</div>

### Docker Compose - Single-host deployment
Docker Finder can be runned locally as a multi-container Docker application using *Docker Compose*.

In order to run **DockerFinder** into your local host, copy, paste, and tun  the following command.

```
$ git clone https://github.com/di-unipi-socc/DockerFinder.git && cd DockerFinder &&
docker-compose up -d

```

It starts all the services of **DockerFinder** into your local host *127.0.0.1*.

Every service can be reached:
- [GUI  (port 80)](http://127.0.0.0.1/dockerfinder)
- [Images API (port 3000)](http://127.0.0.1:3000/api/images)
- [Software API (port 3001)](http://127.0.0.1:3001/api/software)
- [RabbitMQ managment (port 8082)](http://127.0.0.1:8082)



In order to stop all the containers:

```
$ docker-compose stop
```

### Docker Swarm - Multiple-host deployment

The requirements for deploying DockeFinder as a swarm are:
- `docker >= 1.13`
- `docker-compose >= 1.10`
- `docker-machine >= 0.9`
- `Virtualbox > 5`

DockerFinder is deployed in 3 VMs using *virtualBox*, where :
- *swarm-manger* is the Vm where the core services of Docker Finder are executed : *crawler*, *rabbitmq*,*images_server*, *images_db*, *software_server*, *software_db*,   *webapp*.
- *worker-1*: is the VM where the *scanner* s are executed.
- *worker-2*: is the VM here the *scanner* s are executed.

The script `init-all.sh`:
- creates 3 virtualbox VMs with the `docker-machine` tool and initialize a swarm with the `docker swarm` command, composed by three nodes:
      - `swarm-manager`: is the manager of the swarm
      - `worker-1`: is the first worker
      - `worker-2`: is the second worker.

#### How to run


```
./init-all.sh
```
Enter in the `swarm-manager` machine:
```
eval $(docker-machine env swarm-manager)
```
Deploy the services:
 ```
 docker stack deploy --compose-file=docker-compose.yml df
 ```

Monitor the services:
```
docker stack ps df
```

Stop the services:
```
docker stack rm df
```

<!-- - initialize an overlay network (if it does not exist).
- *Build* and *push* the images into [Docker Hub- diunipisocc](https://hub.docker.com/r/diunipisocc/docker-finder/tags/) (must be looged-in).

The `start_all.sh` script:
- *create* the services by downloading the images from [Docker Hub-diunipisocc](https://hub.docker.com/r/diunipisocc/docker-finder/tags/)
- *run* the services:
    - **Crawler**, **RabbiMQ**, **images_server**, **images_db**,**software_server**,**software_db**  ,**monitor**: run in the same host with a constraint  label.
    - **scanner** can run in a any host that are partecipating in the swarm. -->
