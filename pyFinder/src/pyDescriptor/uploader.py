import http.client
import json


class Uploader:

    def __init__(self, host, port=None):
        self.connection = http.client.HTTPConnection(host, port)

    def post_image(self, dict_image, url="/api/images"):
        json_image = json.dumps(dict_image, indent=4)
        print(json_image)
        headers = {'Content-type': 'application/json'}
        self.connection.request('POST', url, json_image, headers)
        response = self.connection.getresponse();
        print("["+dict_image['repo_name']+"] posted to "+self.connection.host)
        return response.read().decode()


    def get(self, url):
        self.connection.request('GET', url)
        response = self.connection.getresponse();
        return response.read().decode()

    def get_images(self, url="/api/images"):
        return self.get(url)


