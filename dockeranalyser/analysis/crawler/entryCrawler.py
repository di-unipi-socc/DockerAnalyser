from crawler import Crawler
from docopt import docopt
from os import path
import logging.config

# policy = 'stars',
# min_stars = 0,
# min_pulls = 0,
# only_automated = False,
# only_official = False
__doc__ = """Crawler

Usage:
  Crawler.py crawl [--policy=<stars_first>] [--min-stars=<0>] [--min-pulls=<0>] [--only-automated] [--only-official]  [--save-url=</tmp/lasturl.txt>] [--amqp-url=<amqp://guest:guest@rabbitmq:5672>] [--hub-url=<https://hub.docker.com>] [--images-url=<http://images_server:3000/api/images>] [--queue=<dofinder>] [--ex=<dofinder>] [--key=<images.scan>] [--random=<False>] [--force-page=<False>] [--fp=<1>] [--ps=<10>]  [--si=<100>]
  Crawler.py (-h | --help)
  Crawler.py --version

Options:
  -h --help     Show this screen.
  --amqp-url=AMQP_URL  Complete amqp url of the rabbitMQ server     [default: amqp://guest:guest@127.0.0.1:5672]
  --save-url==FILE_SAVE File where the crawler save the last url crawled [default:/tmp/lasturl.txt]
  --queue=QUEUE        Queue is the name of the queue of rabbitMQ   [default: images]
  --hub-url=HUB-URL            The url of the DockerHub             [default: https://hub.docker.com]
  --ex=EXCHANGE        Exchange name in the rabbitMQ.               [default: dofinder]
  --key=KEY            Key routing for the rabbitMQ.                [default: images.scan]
  --fp=FROM_PAGE      From Page: starting page crawled from the docker hub [default: 1].
  --ps=PAGE_SIZE      number of images in a single page                    [default: 100].
  --si=SAMPLED_IMAGES Number of images sampled from Docker hub      [default: None].
  --random=RANDOM     If True the sampled images are random dampled [default: True]
  --force-page=FORCE PAGE   If True the crawler start from the from_image, otherwise take the last url [default: False]
  --policy=POLICY      Policy of crawling Docker Hub images (stars_first, pulls_first, none) [default: stars_first]
  --min-stars=STARS    The images with number of stars > STARS are crawled [deafult: 0]
  --min-pulls=<0>     The images with a number of pulls > PULLS are crawled [default: 0]
  --only-official       If true only the official images are downloaded [default: False]
  --only-automated      If true only the automated imsges are downloaded [default: False]
  --version     Show version.
"""

if __name__ == '__main__':
    args = docopt(__doc__, version='Crawler 0.0.1')

    log_file_path = path.dirname(path.abspath(__file__))+ '/crawler/resources/logging.conf'
    print(log_file_path)
    logging.config.fileConfig(log_file_path)
    logger = logging.getLogger()
    logger.info("Logging conf: "+ log_file_path)

    if args['crawl']:
        crawler = Crawler(amqp_url=args['--amqp-url'],
                          queue=args['--queue'],
                          hub_url=args['--hub-url'],
                          exchange=args['--ex'],
                          route_key=args['--key'],
                        #   path_last_url=args['--save-url'],
                          path_last_url="/tmp/lasturl.txt" if args['--save-url'] is None else  args['--save-url'],
                          policy=args['--policy'],
                          min_pulls=int(args['--min-pulls']),
                          min_stars=int(args['--min-stars']),
                          only_official=args['--only-official'],
                          only_automated=args['--only-automated']
                          )
        crawler.run(num_samples=None if args['--si'] == "None" else int(args['--si']),
                    page_size=None if args['--ps'] == "None" else int(
                        args['--ps']),
                    from_page=None if args['--fp'] == "None" else int(
                        args['--fp']),
                    at_random=True if args['--random'] == "True" else False,
                    force_from_page=True if args['--force-page'] == "True" else False
                    )
