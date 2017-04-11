from flask import Flask, request
from flask_restful import  Api
from orchestrator.resources.compose import Compose
from orchestrator.common.mycompose import get_project

app = Flask(__name__)
api = Api(app)

api.add_resource(Compose,'/app/<string:action>')

load_project()


def load_project():


if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True, port=3003)
