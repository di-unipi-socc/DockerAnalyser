from pyfinder.core import ClientImages, ClientHub, ConsumerRabbit
from pyfinder.deploy.analysis import on_message

import logging
import os

"""This module contains the *Scanner* scheleton."""

class Scanner:

    def __init__(self, amqp_url='amqp://guest:guest@127.0.0.1:5672',
                 exchange=None, queue=None, route_key=None,
                 images_url="http://127.0.0.1:3000/api/images",
                 hub_url="https://hub.docker.com/",
                 socket="unix://var/run/docker.sock"
                 ):

        self.logger = logging.getLogger(__class__.__name__)
        self.logger.info(__class__.__name__ + " logger  initialized")


        #self.client_daemon = docker.DockerClient(
        #    base_url=os.environ.get('DOCKER_HOST') or socket)

        # rabbit consumer of RabbittMQ: receives the images name to scan,
        #  on_message_callback is called when a message is received
        self.consumer = ConsumerRabbit(amqp_url=amqp_url, exchange=exchange,
                                       queue=queue, route_key=route_key,
                                       on_msg_callback=self.on_message_ctx)

        # client of Images Service:  in order to add and update the image description.
        self.client_images = ClientImages(images_url=images_url)

        # client of Docker Hub.
        self.client_hub = ClientHub(docker_hub_endpoint=hub_url)

    def run(self):
        """Start the scanner running the consumer client of the RabbitMQ server."""

        try:
            self.consumer.run()
        except KeyboardInterrupt:
            self.consumer.stop()

    def on_message_ctx(self, json_message):
        self.ctx = {'logger': self.logger,
                    'hub': self.client_hub,
                    'images': self.client_images}

        self.logger.info( "Received message from RabbitMQ. Calling analysis() of the lambda function")
        return analysis(json_message['name'], self.ctx)
