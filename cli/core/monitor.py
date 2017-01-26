import pika
import requests

def count_queue_msg(service="127.0.0.1", queue="images"):

    url = "amqp://guest:guest@"+service+":5672"
    #print("connecting to : " +url)
    connection = pika.BlockingConnection(pika.URLParameters(url))
    # Open the channel
    channel = connection.channel()
    # Declare the queue
    queue =  channel.queue_declare(queue=queue,
                    passive=True,
                    durable=True,
                    exclusive=False,
                    auto_delete=False
                    )

    connection.close()
    c = queue.method.message_count
    return c


def count_analysed_images():
    """Get all the images descriptions."""
    try:
        url_api = "http://127.0.0.1:3000/api/images"
        res = requests.get(url_api)
        if res.status_code == requests.codes.ok:
            return res.json()['count']
        else:
            self.logger.error(str(res.status_code) + " Error code. " + res.text)
    except requests.exceptions.ConnectionError as e:
        self.logger.exception("ConnectionError: ")
    except:
        self.logger.exception("Unexpected error:")
        raise
