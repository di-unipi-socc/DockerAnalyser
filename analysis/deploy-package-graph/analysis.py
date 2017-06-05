import requests
from lxml import html
import re


def on_message(image, context):
    # {"star_count": 1177, "pull_count": 20511731, "repo_owner": null,
    # "short_description": "GitLab Comm",
    # "is_automated": true, "is_official": false,
    # "repo_name": "gitlab/gitlab-ce",
    # "tag": "nightly", "name": "gitlab/gitlab-ce:nightly",
    # "full_size": 412857400

    logger = context['logger']
    # client_images = context['images']

    repo = image["repo_name"]
    logger.info("Received image to be analysed: {} ".format(repo))
    if not is_stored_locally(repo):
        # image is not present into local database
        logger.info("{} is not present into local database} ".format(repo))
        # image dictionary with the field to be sent to the images_server
        node_image = {'name': repo}
        dockerfile = get_dockerfile(repo)
        from_repo, from_tag = extract_FROM(dockerfile)
        logger.info("{} FROM {} {}"
                    .format(reo, from_repo,
                            "" if from_tag is None else from_tag))

        node_image['from_repo'] = from_repo
        node_image['from_tag'] = from_tag
        node_image["is_official"] = image["is_official"]
        node_image["is_automated"] = image["is_automated"]
        logger.info("POST {} ".format(node_image))
        client_images.post_image(node_image)
        return True
    else:
        logger.info("{}  already present into local database ".format(repo))
        return True


def is_stored_locally(repo_name):
    """
    Return True if the *repo_name** is stored into *images_server*,
    else return False.
    Example:
    repo name: *sameersbn/gitlab*:
        GET http://127.0.0.1:3000/api/images?name=sameersbn/gitlab
    """
    try:
        response = requests.get("http://images_server:3000/api/images?name={}"
                                .format(repo))
        return True if response.json()['count'] == 0 else False
    except ConnectionError as e:
        logger.error(str(e))
        raise


def extract_FROM(dockerfile):
    from_image = re.search('FROM ([^\s]+)', dockerfile).group(1)
    if ":" in from_image:  # FROM  reponame:tag
        from_repo, from_tag = from_image.split(":")
    else:                  # FROM reponame
        from_repo = from_image
        from_tag = None
    return from_repo, from_tag


def get_dockerfile(repo_name):
    #  https://hub.docker.com/v2/repositories/dido/webofficina/dockerfile/
    #  https://hub.docker.com/v2/repositories/kaggle/python/dockerfile/
    docker_url = "https://hub.docker.com/v2/repositories/{}/dockerfile/"
    logger.info(docker_url.format(repo_name))
    response = requests.get(docker_url.format(repo_name))
    dockerfile = response.json()['contents']
    return dockerfile


def get_officials_FROM():
    # GITHUB official library
    # https://github.com/docker-library/official-images/tree/master/library
    # https://raw.githubusercontent.com/docker-library/official-images/master/library/[java]

    github_url = "https://github.com/"

    page = requests.get(github_url +
                        "docker-library/official-images/tree/master/library")
    tree = html.fromstring(page.content)

    # list of names of the official images [''adminer', 'aerospike',..]
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
                    for d in githubrepo_dirs]    # i.strip()
            node["Directory"] = dirs

            for directory in node["Directory"]:
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
                yield node
        else:
            print("GitRepo has not been found")

    # https://raw.githubusercontent.com/docker-library/[repository]/master/[directory]/Dockerfile
    # https://raw.githubusercontent.com/tianon/docker-bash/master/4.3/Dockerfile


# for image in get_officials_FROM():
#     print(image)
