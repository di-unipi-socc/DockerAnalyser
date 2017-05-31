import requests
from lxml import html
import sys

# # https://hub.docker.com/v2/repositories/dido/webofficina/dockerfile/

# {"contents": "FROM python:2.7\n\n# FileAuthor /Maintaner\nMAINTAINER Davide
# Neri\n\nENV PYTHONUNBUFFERED 1\nRUN mkdir /code\nWORKDIR /code\nADD requirements.txt <
# /code/\nRUN pip install -r requirements.txt\nADD . /code/\n"}


# GITHUB official library
# https://github.com/docker-library/official-images/tree/master/library
# https://raw.githubusercontent.com/docker-library/official-images/master/library/[java]

#image = "dido/webofficina:crawler"

if len(sys.argv) > 1:
    image = sys.argv[1]

    repo, tag = image.split(":")


    r = requests.get("https://hub.docker.com/v2/repositories/{}/dockerfile"
                     .format(repo))

    print(r.json())

github_url = "https://github.com/"
page = requests.get("https://github.com/docker-library/official-images/tree/master/library")

tree = html.fromstring(page.content)

# return the list of name of the official images [''adminer', 'aerospike', 'alpine']
name_off = tree.xpath('//td[@class="content"]/span/a/text()')

d = dict()
for name in name_off:
    # retrive the url path to the github library official e.g.  ['/docker-library/official-images/blob/master/library/adminer']
    print(name)
    href = tree.xpath('//*[@title="{}"]/@href'.format(name))
    d[name] = name
    print(href)
    d["gitOfficial"] = href[0]

    git_url = github_url+href[0] # https://github.com//docker-library/official-images/blob/master/library/adminer
    off_git_page = requests.get(github_url+href[0])
    tree_github = html.fromstring(off_git_page.content)
    # get the GitHub repository url of the official image
    githubrepo = tree_github.xpath("//tr[td[contains(text(), 'GitRepo')]]/*/text()")


    #page = requests.get('https://github.com//docker-library/official-images/blob/master/library/busybox')
    #tree_github = html.fromstring(page.content)
    #githubrepo = tree_github.xpath("//tr[td[contains(text(), 'GitRepo')]]/*/text()")      # 'GitRepo: https://github.com/TimWolla/docker-adminer.git'
    if len(githubrepo) > 0:
        githubrepo = githubrepo[0]
        print(githubrepo)
        githubrepo_dirs = tree_github.xpath("//tr[td[contains(text(), 'Directory')]]/*/text()")  #  //tr[td[contains(text(), 'Directory')]]/*/text()"  // 'Directory: 4.3'
        # githubrepo_tags = tree_github.xpath("//tr[td[contains(text(), 'Directory')]]/*/text()")
        dirs = [d.split(":")[1].strip() for d in githubrepo_dirs]                         # i.strip()
        d["Directory"] = dirs

        for directory in d["Directory"]:
            # githubrepo   # https://github.com/TimWolla/docker-adminer.git' => TimWolla/docker-adminer
            #print(githubrepo)
            startString = 'https://github.com/'
            endString = '.git'

            repo = githubrepo[githubrepo.find(startString)+len(startString):githubrepo.find(endString)]
            #print(repo)

            dockerfile = requests.get("https://raw.githubusercontent.com/{}/master/{}/Dockerfile".format(repo,directory))
            print(dockerfile.content)
    else:
         print("GirRepo has not been found")

# https://raw.githubusercontent.com/docker-library/[repository]/master/[directory]/Dockerfile
# https://raw.githubusercontent.com/tianon/docker-bash/master/4.3/Dockerfile
