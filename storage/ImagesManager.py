import json
import requests
from docopt import docopt


def upload_images(file_json, url="http://127.0.0.1:3001/api/images", ):

    with open(file_json) as json_data:
        images = json.load(json_data)
        tot_upload = 0
        for image in images:
            try:
                res = requests.post(
                    url, headers={'Content-type': 'application/json'}, json=image)
                if res.status_code == requests.codes.created or res.status_code == requests.codes.ok:
                    print("[" + image['name'] + "] added into " + res.url)
                    tot_upload += 1
                else:
                    print(str(res.status_code) + " response: " + res.text)
            except requests.exceptions.ConnectionError as e:
                self.logger.exception("ConnectionError: " + str(e))
            except Exception as e:
                print(str(e))
        print(str(tot_upload) + " images  uploaded")


def delete_all_images(url="http://127.0.0.1:3001/api/images"):
    res = requests.get(url).json() # {"count":196,"page":11,"limit":20,"pages":10,"images":[]}
    count, page, limit, pages = (res[key]
                                 for key in ['count', 'page', 'limit', 'pages'])
    deleted = 0;
    for _ in range(pages):
        for image in yield_images_from_page(url="http://127.0.0.1:3000/api/images"):
            _delete_image(url, image)
            deleted +=1
    print("{} total images deleted".format(deleted))

def _delete_image(url, image):
    url_delete = url + "/" + image['_id']
    requests.delete(url_delete)
    print("{} deleted ".format(image['name']))


def yield_all_images(url="http://127.0.0.1:3000/api/images"):
    res = requests.get(url).json() # {"count":196,"page":11,"limit":20,"pages":10,"images":[]}
    count, page, limit, pages = (res[key]
                                 for key in ['count', 'page', 'limit', 'pages'])
    print("{} total images stored into database, {} pages".format(count, pages))
    for next_page in range(page, pages + 1):
        for image in yield_images_from_page(url,next_page,limit):
            yield image

def yield_images_from_page(url="http://127.0.0.1:3000/api/images", page=1, limit=100):
    res = requests.get(url, params={'page': page, 'limit': limit})
    images = res.json()['images']
    for i in images:
        yield i


def pull_images(path_file_json, url="http://127.0.0.1:3000/api/images"):
    # with open(path_file_json, mode='w', encoding='utf-8') as f:
    #     json.dump([], f)
    list_json_images = list()
    for image in yield_all_images(url):
        list_json_images.append(image)

    with open(path_file_json, 'w') as f:
        json.dump(list_json_images, f, ensure_ascii=False)
        print("{} images saved into {}".format(len(list_json_images),path_file_json))





__doc__ = """ImagesManager

Usage:
  Tester.py pull  [--file=<images.json>] [--images-url=<http://127.0.0.1:3000/api/images>]
  Tester.py upload [--file=<images.json>] [--images-url=<http://127.0.0.1:3000/api/images>]
  Tester.py rm    [--images-url=<http://127.0.0.1:3000/api/images>]
  Tester.py (-h | --help)
  Tester.py --version

Options:
  -h --help     Show this screen.
  --file=FILE        File JSON with all the images   [default: images.json]
  --images-url=IMAGESSERVICE  Url images service [default: http://127.0.0.1:3000/api/images].
  --version     Show version.
"""

if __name__ == "__main__":
    args = docopt(__doc__, version='SoftwareManger 0.0.1')
    if args['upload']:
        upload_images(args['--file'], args['--images-url'])

    if args['pull']:
        pull_images(path_file_json=args['--file'], url=args['--images-url'])

    if args['rm']:
        delete_all_images(args['--images-url'])
