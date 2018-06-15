/**
 * Created by dido on 7/14/16.
 */
"use strict";
var express = require('express');
var router = express.Router();
var Image = require('../models/image-noschema');

//method for looking if a string is in a list
String.prototype.inList = function (list) {
    return ( list.indexOf(this.toString()) != -1)
};


// convert a string parameter to boolean value
function stringToIntegerOrBoolean(parameter){
    var param = parameter.toLowerCase().trim();
    if(!isNaN(param)){
      console.log("retrn a number");
      return +param;
    }
    switch(param){
        case "true": return true;
        case "false": case null: return false;
        default: return param;
    }
}


//all the parameters that are not Attribute of the description of an image
var listParameters=['sort','select', 'limit', 'page',
                    'size', 'size_lt', 'size_gt',
                    'pulls', 'pulls_lt','pulls_gt',
                    'stars', 'stars_lt','stars_gt'
                  ];

// GET /search?<ATTRIBUTE>=<VALUE>&sort=x&size_lt=y
router.get('/', function (req, res, next) {
    console.log("GET " + req.originalUrl);
    var findMatch = {}; //{'softwares': {$all: []}};
    for (var key in req.query) {  //
        if(!key.inList(listParameters)) {  // check if the parameter is not in the reserved parameters
            //elementMatch = {$elemMatch: {bin: key, ver: {$regex: '^' + req.query[key]}}};
            // findMatch.softwares.$all.push({$elemMatch: {software: key, ver: {$regex: '^' + req.query[key]}}});
            findMatch[key] = {$eq: stringToIntegerOrBoolean(req.query[key])}
            console.log("deleting : " + key +" "+ req.query[key])
            delete req.query.key;
        }
    }
    //##########################################################################

    if(req.query['size']) {
        findMatch.size = {$eq : req.query['size']}
        //queryBuild.where('size', req.query['size']);
        console.log("Size equal " + req.query['size']);
    }
    else if(req.query['size_lt']) {
        findMatch.size = {$lt : req.query['size_lt']}
        //queryBuild.where('size').lt(req.query['size_lt']);
        console.log("Size less than " + req.query['size_lt']);
    }
    else if(req.query['size_gt']) {
        findMatch.size = {$gt : req.query['size_gt']}
        //queryBuild.where('size').gte(req.query['size_gt']);
        //queryBuild.where('size').gt(req.query['size_gt']);
        console.log("Size greater than or equal " + req.query['size_gt']);
    }

    if(req.query['pulls']) {
        //queryBuild.where('pulls', req.query['pulls']);
        findMatch.pulls = {$eq : req.query['pulls']}
        console.log("Pulls equal" + req.query['pulls']);
    }
    else if(req.query['pulls_lt']) {
        findMatch.pulls = {$lt: req.query['pulls_lt']}
        //queryBuild.where('pulls').lt(req.query['pulls_lt']);
        console.log("Pulls less than " + req.query['pulls_lt']);
    }
    else if(req.query['pulls_gt']) {
        findMatch.pulls = {$gt: req.query['pulls_gt']}
        // TODO grater than or equal in the API
        //queryBuild.where('pulls').gt(req.query['pulls_gt']);
        //queryBuild.where('pulls').gte(req.query['pulls_gt']);
        console.log("Pulls greater than or equal" + req.query['pulls_gt']);
    }
    if(req.query['stars']) {
        findMatch.stars = {$eq: req.query['stars']}
        //queryBuild.where('stars', req.query['stars']);
        console.log("Stars equal" + req.query['stars']);
    }
    else if(req.query['stars_lt']) {
        findMatch.stars = {$lt: req.query['stars_lt']}
      //  queryBuild.where('stars').lt(req.query['stars_lt']);
        console.log("Stars less than " + req.query['stars_lt']);
    }
    else if(req.query['stars_gt']) {
      findMatch.stars = {$gt: req.query['stars_gt']}
        // TODO grater than or equal in the API
      //  queryBuild.where('stars').gte(req.query['stars_gt']);
        console.log("Stars greater than or equal" + req.query['stars_gt']);
    }

    var sort = {};
    switch(req.query.sort){
        case 'stars':
            console.log("Sorting  by ascending stars.");
            sort =  {'stars': -1};
            break;
        case '-stars':
            console.log("Sorting  by descending stars.");
            sort =  {'stars': 1};
            break;
        case 'pulls':
            console.log("Sorting  by ascending pull.");
            sort = { 'pulls': -1};
            break;
         case '-pulls':
            console.log("Sorting  by descending pull.");
            sort = { 'pulls': 1};
            break;
        default:
            var ordering = '-stars -pulls';  //-pull_count
            console.log("DEFAULT ordering "+ordering);
            sort =  ordering
            break;
      }

    var options = {
        select: (req.query.select)?req.query.select: '',
        page: (req.query.page)?Number(req.query.page): 1,
        limit: (req.query.limit)?Number(req.query.limit): 20
      };

    Image.paginate(findMatch, options, function(err, result) {
      if (err) {
              console.log(err);
              return next(err);}
      res.json({"count": result.total,
                "page":result.page,
                "limit":result.limit,
                "pages":result.pages,
                "images": result.docs
              });
      console.log("Total Results: " + result.total)
  });
});

// Return router
module.exports = router;
