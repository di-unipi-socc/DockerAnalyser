
git clone --depth 1 git@github.com:di-unipi-socc/DockerAnalyser.git
sudo npm install -g cloc
cloc DockerAnalyser --exclude-dir=data
rm -rf DockerAnalyser
