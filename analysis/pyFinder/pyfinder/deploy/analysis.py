import docker

# client of Docker daemon running on the local host
client_daemon = docker.DockerClient(base_url='unix://var/run/docker.sock')

def on_message(json_image, context):
    logger = context['logger']
    #docker_hub = context['hub']
    #client_images = context['images']

    logger.info("{} image received ".format(json_image['name']))


    # {'star_count': 107,
    # 'pull_count': 1430790,
    # 'repo_owner': None,
    # 'short_description': '',
    #  'is_automated': True,
    #  'is_official': False,
    #  'repo_name': 'sameersbn/postgresql',
    #  'tag': '9.4-17',
    #  'name': 'sameersbn/postgresql:9.4-17',
    #  'full_size': 81978718,
    #  'images': [{'size': 81978718}], 'id': 2384003,
    #  'repository': 14080, 'creator': 3263,
    #  'last_updater': 3263,
    #  'last_updated': '2016-03-22T06:46:03.447956Z',
    #  'image_id': None, 'v2': True}
    #  }

    return True
