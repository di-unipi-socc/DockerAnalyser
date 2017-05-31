import docker

# client of Docker daemon running on the local host
self.client_daemon = docker.DockerClient(base_url='unix://var/run/docker.sock')

def on_message(json_image_tag, context):
    logger = context['logger']
    #docker_hub = context['hub']
    #client_images = context['images']

    logger.info("Received image to be analysed: {} ".format(json_image_tag))


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

    # image object of python docker SDK
    image_json = {}
    image = self.client_daemon.images.pull(json_image_tag["repo_name"])
    logger.info("{}: downloaded image ".format(image.name))

    image_json['id'] = image.id
    image_json['short_id'] = image.short_id                # The ID of the image truncated to 10 characters, plus the sha256: prefix. 'sha256:2a5dd3169d'
    image_json['layers'] = image.attrs['RootFS']['Layers'] # array of SHA 'sha256:05b940eef08d146119d8273e7a24056c5879991164fff0583e5f926cf86d3779'





    return True
