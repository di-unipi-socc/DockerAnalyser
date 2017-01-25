from flask_restful import Resource
from orchestrator.common.mycompose import get_project


class Compose(Resource):
    def get(self, action):
        if action=="build":
            return {"build":"all"}
        elif action =="up":
            return {"up":"all"}
        elif action=="stop":
            return {"stop":"all"}
