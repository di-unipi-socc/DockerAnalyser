import json
import docker
import re
import os

client_docker= docker.DockerClient(base_url="unix://var/run/docker.sock")

def analysis(images_json, context):
    logger = context['logger']
    client_images = context['images']

    logger.info("{0} received".format(images_json['name']))
    logger.info("Pulling image {0} ...".format(images_json['name']))
    try:
        image = client_docker.images.pull(images_json['name']) # images_json['repo_name'], tag=images_json['tag'])
        container = client_docker.containers.create(images_json['name'],
                                                    entrypoint="sleep  infinity")
        container.start()
        softwares = {}
        with open(os.path.join(
                  os.path.dirname(__file__), 'softwares.json')) as softwares_json:
            software = json.load(softwares_json)
            logger.info("{0} Searching software... ".format(images_json['name']))
            for sw in software:
                output = container.exec_run(cmd=sw['cmd']).decode()
                match = re.search(sw['regex'], output)
                if match:
                    version = match.group(0)
                    softwares[sw['name']] = match.group(0)
                    logger.debug("{0} {1} found.".format(sw['name'], version))
                else:
                    logger.debug("[{0}] NOT found in ".format(sw['name']))
        logger.info('[' + ''.join('{} {},'.format(s, v)
                                  for s, v in softwares.items()) + "]")
        images_json['softwares'] = softwares
        client_images.post_image(images_json)
        logger.debug("[{0}] inserted into images".format(sw['name']))
        container.stop(timeout=2)
        container.remove()
        client_docker.images.remove(images_json['name'], force=True)
        logger.info("Removed image {0}".format(images_json['name']))
    except docker.errors.ImageNotFound as e:
        logger.exception("{} image not found".format(images_json['name']))
        return False
    return True
