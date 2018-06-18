# Storage
DockerFinder stores all image descriptions produced by the
Scanners into a **local repository**, and it makes them accessible
to the other microservices in DockerFinder through a RESTful API.

```
Storage
|
|___images_server:
|   |___models
|   |   |___image-noschema.js: defines the model of an image's description
|   |___routes
|        |___api-noschema.js : the RESTful  API for the mansing the images
|        |___search-paginated.js: the search API for searching the images.
|
|____imagesManager.py: python script for DOWLAOD, UPLOAD or REMOVE the imagee stored into the database

```


# RESTful API of the images service
The API is exposed to the port `3000` on the endpoint `/api/images`

Images in the storage are schema-less structures.  Every image can be described with any **key:value** filed.

```
var imageSchema =  new mongoose.Schema({ },{"strict":false});
```

### Retrieving images
The GET operation returns all the images stored into the local repository of Docker Finder.

```
GET /api/images
```

It returns a JSON, where   is the number of total images returned, and *images* is an array of JSON object describiing the images.

```
{
  "count": NUMBER,
  "page": NUMBER,
  "limit": NUMBER,
  "pages": NUMBER,
  "images":  [{
             <Image 1>
           },{
              ...
             <Image n>,
      }
    ]
}
```

All the parameters of the `GET /api/images/` methods are shown in the table below:

| Parameter 	| Example                               	| description                                         	|
|-----------	|---------------------------------------	|-----------------------------------------------------	|
| sort      	| /api/images?sort=name                 	| Sorts the images by name in ascending order (A-Z).  	|
|           	| /api/images?sort=-name                	| Sorts the images by name in descending order (Z-A). 	|
| select    	| /api/images?select=*x*                	| Selects only the *x* attribute of the images.       	|
|           	| /api/images?select=name               	| Selects only the *name* of the images.                	|
| skip      	| /api/images?skip=5                    	| Skips the first 5 images.                           	|
| limit     	| /api/images?limit=5                   	| Returns the first 5 images.                         	|
| equals    	| /api/images?name__equals=nginx        	| Returns the image with name *nginx*.                  	|
|           	| /api/images?name=nginx                	| Returns the image with name *nginx*.                  	|
| ne        	| /api/images?name__ne=nginx            	| Returns  images who are not name *nginx*.             	|
| gt        	| /api/images?size__gt=200              	| Gets images with size > 200 bytes.                  	|
| gte       	| /api/images?size__gte=200             	| Gets images with size ≥ 200 bytes.                  	|
| lt        	| /api/images?size__lt=200              	| Gets images with size < 200 bytes.                  	|
| lte       	| /api/images?size__lte=200             	| Gets images with size ≤ 200 bytes.                  	|
| in        	| /api/images?size__in=30,200           	| Gets images with size 30 or 200 bytes               	|
| nin       	| /api/images?size__nin=18,30           	| Gets images with size not 18, 30.                   	|
| regex     	| /api/images?description__regex=Docker 	| Gets images with *Docker* in description.             	|



#### Adding new image
In order to add a new description of an image, the POST
method is used.
```
POST /api/images
```
The body of the request contains the JSON object of the image description
to add. An example of a request it is shown below.

```
POST /api/images
{
    "name":"onepill/docker-openresty:latest",
    "description":"OpenResty version of https://hub.docker.com/r/kyma/docker-nginx/",
    "softwares":[
        {"ver":"1.24.2","software":"httpd"},
        {"ver":"1.24.2","software":"wget"}
        ]
}
```
### Updating images
The PUT method permits updating the description of an image, whose the unique identifier is *id*.

```
PUT /api/images/:id
```
The body of the request contains the values of the image to update. In
the example below only the *name* and description fields of the
image with id 000011112222 are updated.
```
PUT /api/images/000011112222
{
  "name" : "repositoy/newname" ,
  "description" : "New description of the image"
}
```

### Deleting images
The HTTP method DELETE permits to delete an image
description. The *id* is the unique identifier of the image to delete.

```
DELETE /api/images/:id
```



## Search images
The `/search` interface permits searching  for (description of) images.

The query syntax is a list of *KEY* and *VALUE* pair separated by *&*.

```
GET /search?<KEY>=<VALUE>[&<KEY>=<VALUE>]*
```
Where:
  - **KEY** can be any key attributes contained in  the JSON describing an image (e.g., *name*),
Nested attribute must be separated with a point (e.g., software.java)

- **VALUE** is the value of a particular KEY to be searched.


For example, if an user wants to retrieve all the images with *star_count=30* the query to be submit is the following:

```
GET /search?star_count=30

// return all the images with the key="star_count" and value=30.
```

The response is a JSON of the form:
```
{
  "count": {Number},  // total number of documnets matching the query
  "page":{number},    // the page number submitted
  "limit":{Number},   // number of results per page submitted
  "pages":{pages},    // the total pages for retrieving all the results
  "images":           // list of images satisfying the query
    [
      {Image},
      {Image}
    ]  
}
```
### Filtering the results
The results of a query cna be filterd

| Example             | Description                                                                                       |
|-------------------------|---------------------------------------------------------------------------------------------------|
| GET /search?page=X    | Returns the page number X            |
| GET /search?limit=Y   | Limit as Y the number returned in a single page |
| GET /search?sort=pulls, -pulls, stars, -stars >   | Sorts the results by pull or stars |


User can filter the results of the previous query example by adding
additional parameters.


| Example                                       | Description                                                                                       |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------|
| GET /search?python=3.4&bash=4.3&stars_gt=5    | Search images that have python3.4 ans bash 4.3 with a number of stars greater than 5.             |
| GET /search?python=3.4&bash=4.3&pulls_gte=5   | Search images that have python3.4 ans bash 4.3 with a number of pulls greater than or equal to 5. |
| GET /search?python=3.4&bash=4.3&size_lt=10000 | Search images that have python3.4 ans bash 4.3 with size less than 10000 bytes.                   |
