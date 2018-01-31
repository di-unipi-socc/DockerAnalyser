# Analysis
The analysis of each image consists in retrieving all the metadata already
available in the registry, and in running a container to au-
tomatically extract its runtime features (e.g., the software
distributions it support). All collected information are used
to build the multi-attribute description of an image.
```
Analysis
|
|___DockerFile_scanner: defines the scanner image.
|___DockerFile_crawler: defines the crawler image.
|
|____crawler:
     |____crawler
     |    |_____(code of cralwer)    
     |
     |____entryChecker.py: the entrypoint of the checker
     |
     scanner
     |____scanner
     |    |___deploy
     |    |
     |    |__ (code of scanner)
     |    
     |____entryScanner.py: the entrypoint of the Scanner.
```



## Crawler
Crawler crawls the images'name from a Docker registry. The are two crawling policies
  1. Crawl all the images from a registry
  2. Select a random uniform number of images from the Docker registry.

## scanner
Scanner analyse each single image.
