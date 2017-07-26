import docker
import sys


i = sys.argv[1]
i2 = sys.argv[2]

c = docker.DockerClient(base_url='unix://var/run/docker.sock')


client = docker.APIClient(base_url='unix://var/run/docker.sock')

c.images.pull(i)
c.images.pull(i2)

inspect = client.inspect_image(i)
inspect2 = client.inspect_image(i2)

print(inspect['RootFS']['Layers'])
print("  ")
print(inspect2['RootFS']['Layers'])

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
