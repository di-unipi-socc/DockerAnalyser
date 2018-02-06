#  DockerAnalyser

[Department of Computer Science, University of Pisa](https://www.di.unipi.it/en/)

Author: Davide Neri.

Contact: davide.neri@di.unipi.it

## DockerAnalyser in a  nutshell


> `DockerAnalyser` is a microservice-based tool that permits building analysers of Docker images.


DockerAnalyser (figure below) is designed to
 - crawl Docker images from a remote Docker registry (e.g. Docker Hub),
 - analyse each image by running an analysis function, and
 - store the results into a local database.

<div align="center">
  <img  src="./data/docs/docker-analyser.png" width="400">
</div>

## The architectue of DockerAnlyser
DockerAnalyser is a microservice-based architecture (figure below).
Each microservice is responsable to manage a single operation of the architectue:
 - **crawler**: crawls the Docker image *names* to be analysed from a remote Docker registry.
 - **rabbitMQ**: is a Message Broker that store the names of the images to be analysed (from the Crawler) into a messages queue, and it permits the Scanners to retrieve them.
 - **scanner**: retrieves the name of the images from the Message Broker, and for each name received it runs an *analysis function*.
 - **ImagesService** and **ImagesDB**: is the microservice that store the obtained description ina local storage.  **ImagesService** exposes the APIs while **ImagesDB** is a NOsql database.

 <div align="center">
 <img  src="./data/docs/architecture.png" width="300">
 </div>

## How to create a new Docker image analyser
> Users can build their own image analysers by replacing the  *analysis analysis* function (contained in the **deploy package**)  executed by the *scanner* microservice.


More precisley, the steps needed to create an analyser are the following:
1. Clone the [GitHub ](https://github.com/di-unipi-socc/DockerAnalyser.git) repository of DockerAnlyser locally.
2. Create a folder *F* (that represents the **deploy package**) and inside the created folder
create the following files:
 - The *analysis.py* file that contains the code of the custom analysis function,
 - The *requirements.txt* file that contains the Python library dependencies † ,
 - Any other file needed by the analysis function (e.g., configuration files)
3. Build the Scanner Docker image with  [Docker Compose](https://docs.docker.com/compose/install/) by running the command
`docker-compose build --build-arg deploy=<F> scanner`, (where F is the
name of the folder created at step 2).



Two examples of analysers can be found in the  [examples](./data/examples/README.md) folder.
