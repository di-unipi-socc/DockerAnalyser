
def analysis(json_image, context):

    logger = context['logger']
    client_images = context['images']

    logger.info("{}: received. ".format(json_image))
    client_images.post_image(json_image)

    # {"star_count": 107,
    # "pull_count": 1430790,
    # "repo_owner": None,
    # "short_description": "",
    #  "is_automated": True,
    #  "is_official": False,
    #  "repo_name": "sameersbn/postgresql",
    #  "tag": "9.4-17",
    #  "name": "sameersbn/postgresql:9.4-17",
    #  "full_size": 81978718,
    #  "images": [{"size": 81978718}], "id": 2384003,
    #  "repository": 14080, "creator": 3263,
    #  "last_updater": 3263,
    #  "last_updated": "2016-03-22T06:46:03.447956Z",
    #  "image_id": None, "v2": True}
    #  }

    return True
