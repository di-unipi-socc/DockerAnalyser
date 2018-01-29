#!/usr/bin/env bash

MANAGER_NODE="node-1"
DEPLOY_PACKAGE="deploy-package"
STACK_NAME="docker-analyser"
DOCKER_COMPOSE="docker-compose-myregistry.yml"

function usage()
{
    echo "Starts the services of the docker-compose file in the swarm using docker stack deploy command."
    echo ""
    echo "./start_all.sh"
    echo "   -h --help"
    echo "   --manager-hostname=$MANAGER_NODE"
    echo "   --deploy-package=$DEPLOY_PACKAGE"
    echo "   --stack=$STACK_NAME"
    echo ""
}

while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | awk -F= '{print $2}'`
    case $PARAM in
        -h | --help)
            usage
            exit
            ;;
        --manager-hostname)
            MANAGER_NODE=$VALUE
            ;;
        --deploy-package)
            DEPLOY_PACKAGE=$VALUE
            ;;
        --stack)
            STACK_NAME=$VALUE
            ;;
        *)
            echo "ERROR: unknown parameter \"$PARAM\""
            usage
            exit 1
            ;;
    esac
    shift
done
echo "Manager node: $MANAGER_NODE"
echo "Deploy package path : $DEPLOY_PACKAGE"
echo "Stack name : $STACK_NAME"


# enter into the manager environment
eval $(docker-machine env $MANAGER_NODE)

if ! [ -x "$(command -v docker-compose)" ]; then
    echo "Installing docker-compose into ${MANAGER_NODE} ..."
    sudo curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose;
    sudo chmod +x /usr/local/bin/docker-compose;
else
   echo "docker-compose is installed into ${MANAGER_NODE} ."
fi

# starts a local registry inside the manager node
docker service create --name registry --publish published=5000,target=5000 registry:2

# create the analyser
abs_path=$(cd $(dirname $0)/.. && pwd) #/home/dido/github/DockerAnalyser
cd $abs_path

docker-compose -f ${DOCKER_COMPOSE} build crawler rabbitmq images_server images_db &> /dev/null
echo 'Build: crawler, rabbitmq, images_server, images_db succesfully.'
# build the scanner image
docker-compose -f ${DOCKER_COMPOSE} build --build-arg DEPLOY_PACKAGE_PATH=${DEPLOY_PACKAGE} scanner &> /dev/null
echo "Build: scanner with the  ${DEPLOY_PACKAGE} deploy package "
# push the images into the local registry
docker-compose -f ${DOCKER_COMPOSE} push &> /dev/null
echo "Push the docker images into the local registry. "
# run the services in a stack
docker stack deploy --compose-file ${DOCKER_COMPOSE} ${STACK_NAME} &> /dev/null
echo "Stack ${STACK_NAME} deployed correctly."
docker stack ps   ${STACK_NAME}
