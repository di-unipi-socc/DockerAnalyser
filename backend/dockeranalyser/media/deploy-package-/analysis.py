def analysis(image_json, context):
    logger = context['logger']
    client_images = context['images']
    logger.info('Received image from rabbitMQ: {}'.format(image_json))
    client_images.post_image(image_json)
    return True