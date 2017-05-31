import requests
from lxml import html
import sys

import re


# {"contents": "FROM python:2.7\n\n# FileAuthor /Maintaner\nMAINTAINER Davide
# Neri\n\nENV PYTHONUNBUFFERED 1\nRUN mkdir /code\nWORKDIR /code\nADD requirements.txt <
# /code/\nRUN pip install -r requirements.txt\nADD . /code/\n"}


# GITHUB official library
# https://github.com/docker-library/official-images/tree/master/library
# https://raw.githubusercontent.com/docker-library/official-images/master/library/[java]

def parse_dockerfile(dockerfile):
    return re.search('FROM ([^\s]+)', dockerfile).group(1)


if len(sys.argv) > 1:
    image = sys.argv[1]

    repo, tag = image.split(":")

    r = requests.get("https://hub.docker.com/v2/repositories/{}/dockerfile"
                     .format(repo))

    print(r.json())

github_url = "https://github.com/"


def getOfficialsDockerfiles():
    page = requests.get(
        "https://github.com/docker-library/official-images/tree/master/library")

    tree = html.fromstring(page.content)

    # return the list of name of the official images [''adminer', 'aerospike',
    name_off = tree.xpath('//td[@class="content"]/span/a/text()')

    node = dict()

    for name in name_off:
        # retrive the url path to the github library official e.g.
        # ['/docker-library/official-images/blob/master/library/adminer']
        print("Searching image {} ".format(name))
        href = tree.xpath('//*[@title="{}"]/@href'.format(name))
        node["name"] = name

        # https://github.com//docker-library/official-images/blob/master/library/adminer
        git_url = github_url + href[0]

        node['gitrepo'] = git_url

        off_git_page = requests.get(git_url)
        tree_github = html.fromstring(off_git_page.content)
        # get the GitHub repository url of the official image
        githubrepo = tree_github.xpath(
            "//tr[td[contains(text(), 'GitRepo')]]/*/text()")

        # https://github.com/TimWolla/docker-adminer.git'
        if len(githubrepo) > 0:
            githubrepo = githubrepo[0]
            # print(githubrepo)
            # //tr[td[contains(text(), 'Directory')]]/*/text()"  // 'Directory: 4.3'
            githubrepo_dirs = tree_github.xpath(
                "//tr[td[contains(text(), 'Directory')]]/*/text()")
            # githubrepo_tags = tree_github.xpath("//tr[td[contains(text(), 'Directory')]]/*/text()")
            dirs = [d.split(":")[1].strip()
                    for d in githubrepo_dirs]                         # i.strip()
            d["Directory"] = dirs

            for directory in d["Directory"]:
                # githubrepo   # https://github.com/TimWolla/docker-adminer.git' => TimWolla/docker-adminer
                startString = 'https://github.com/'
                endString = '.git'

                repo = githubrepo[githubrepo.find(
                    startString) + len(startString):githubrepo.find(endString)]
                # print(repo)

                response_dockerfile = requests.get(
                    "https://raw.githubusercontent.com/{}/master/{}/Dockerfile"
                    .format(repo, directory))
                dockerfile = response_dockerfile.text
                from_image = parse_dockerfile(dockerfile)
                print("Base image {} ".format(from_image))
                node['from_image'] = from_image
        else:
            print("GitRepo has not been found")

    # https://raw.githubusercontent.com/docker-library/[repository]/master/[directory]/Dockerfile
    # https://raw.githubusercontent.com/tianon/docker-bash/master/4.3/Dockerfile


def getDockerfile(repo_name):
    docker_url = "https://hub.docker.com/v2/repositories/{}/dockerfile/"
    #  https://hub.docker.com/v2/repositories/dido/webofficina/dockerfile/
    #  https://hub.docker.com/v2/repositories/kaggle/python/dockerfile/
    response = requests.get(docker_url.format(repo_name))
    dockerfile = response.json()['contents']
    return dockerfile

print(getDockerfile("dido/webofficina"))
