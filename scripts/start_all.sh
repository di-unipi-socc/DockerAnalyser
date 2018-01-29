#!/bin/sh


STACK_NAME="docker-analyser"
MANAGER_NODE="node-1"

# install docker-compose within the manager
docker-machine ssh ${MANAGER_NODE} '
sudo curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose;
sudo chmod +x /usr/local/bin/docker-compose;
docker-compose --version;'

# enter into the manager environment
eval $(docker-machine env node-1)

# starts a local registry inside the manager node
docker service create --name registry --publish published=5000,target=5000 registry:2
# build the images
docker-compose -f ../docker-compose-myregistry.yml build 
#docker-compose -f ../docker-compose-myregistry.yml build --build-arg deploy="../analysis/deploy-package-dockerfinder"
# push the images into the local registry
docker-compose -f ../docker-compose-myregistry.yml push
# run the services in a stack
docker stack deploy --compose-file ../docker-compose-myregistry.yml ${STACK_NAME}
