from flask import Flask
from flask_restful import Resource, Api
from flask_restful import reqparse


app = Flask(__name__)
api = Api(app)


# APP API
class Main(Resource):

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('action',type=str, help='Action cannot be converted')
        args = parser.parse_args()
        action = args['action']


api.add_resource(Main, '/main')

if __name__ == '__main__':
    print("ARITITITITI")
    #debug=True,
    app.run(host="0.0.0.0", port=3003)
