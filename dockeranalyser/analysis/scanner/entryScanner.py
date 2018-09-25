from scanner import Scanner
from docopt import docopt
from os import path
import logging.config

__doc__ = """Scanner.

Usage:
    Scanner.py run [--amqp-url=<amqp://guest:guest@127.0.0.1:5672>] [--ex=<dofinder>] [--queue=<images>] [--key=<images.scan>] [--images-url=<http://images_server:3000/api/images>]
    Scanner.py scan <name> [--tag=<latest>]
    Scanner.py exec <name> --p=<program>  --opt=<option>  --regex=<regex>
    Scanner.py (-h | --help)
    Scanner.py --version

Options:
  -h --help             Show this screen.
  --amqp-url=AMQP-URL   url of the rabbitMQ  server             [default: amqp://guest:guest@127.0.0.1:5672]
  --ex=EXCHANGE         The exchange name of the rabbitMQ       [default: dofinder]
  --queue==QUEUE        Queue name of the rabbitMQ server       [default: images]
  --key=KEY             Routing key used by the rabbitMQ server [default: images.scan]
  --images-url=IMAGES_URL      The url of the images service    [default: http://127.0.0.1:3000/api/images]
  --tag=TAG             TAG  of the image to scan               [default: latest]
  --p=PROGRAM           The program name to pass to the container.
  --opt=OPTION          Option of the command to run in the contianer
  --regex=REGEX         Regular expression used to extract info for PROGRAM OPTION
  --version             Show version.
"""


if __name__ == '__main__':
    args = docopt(__doc__, version='Scanner 0.0.1')
    log_file_path = path.dirname(path.abspath(
        __file__)) + '/scanner/resources/logging.conf'
    logging.config.fileConfig(log_file_path)
    logger = logging.getLogger()
    logger.info("Logging conf: " + log_file_path)

    scanner = Scanner(amqp_url=args['--amqp-url'], exchange=args['--ex'], queue=args['--queue'], route_key=args['--key'],
                      images_url=args['--images-url']
                      )

    if args['scan']:
        image_name = args['<name>']
        tag = args['--tag']
        dict_image = scanner.scan(image_name, tag=tag)

        # list of json software :{"software": <name>,  "ver":<version>}
        for sw_json in dict_image['softwares']:
            print(sw_json['software'] + " " + sw_json['ver'])
        print(str(len(dict_image['softwares'])) +
              " software found in " + image_name)
        # print(dict_image['distro'] + " distribution of " + image_name)

    if args['exec']:
        print(args)
        out = scanner.version_from_regex(
            args['<name>'], args['--p'], args['--opt'], args['--regex'])
        print(out)

    if args['run']:
        scanner.run()
