import docker
import sys


i = sys.argv[1]

c = docker.DockerClient(base_url='unix://var/run/docker.sock')


client = docker.APIClient(base_url='unix://var/run/docker.sock')

c.images.pull(i)
inspect = client.inspect_image(i)
parent = inspect['Parent']
#print(inspect)
if parent != "":
    parent_inspect = client.inspect_image(parent)
    #print(parent_inspect['Id'])

    parent_repo_tag = parent_inspect["RepoTags"]
    while len(parent_repo_tag) == 0:
        parent = parent_inspect['Parent']
        parent_inspect = client.inspect_image(parent)
        parent_repo_tag = parent_inspect["RepoTags"]
        #print(parent_inspect['Id'])
    print(parent_repo_tag)
else:
    print("{} is base image ".format(i))
