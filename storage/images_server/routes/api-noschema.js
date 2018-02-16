// Dependencies
"use strict";
var express = require('express');
var router = express.Router();
var Image = require('../models/image-noschema');

//method for looking if a string is in a list
String.prototype.inList = function (list) {
    return ( list.indexOf(this.toString()) != -1)
};

// record all the methods
Image.methods(['get','put','post','delete']).updateOptions({ new: true });

// reserved key parameters of the API query
var _reservedkey=['limit', 'page', 'sort', 'select']

Image.before('get', function (req, res, next) {
    console.log("GET: " + req.originalUrl);

    // query for retrieve the images with binary name and versions
    var findMatch = {};

    for (var key in req.query) {
       if (!key.inList(_reservedkey)){
          // check if is a number or a string
          console.log(key + " " + req.query[key])
          findMatch[key] = { $eq: req.query[key] }
          console.log(findMatch)
        }
      }

  // if images/:id call the next method for retrieving the single iamge by id
   if (req.params.id){
     next()
     return
   }

   // pagination
     var options = {
         select: (req.query.select)?req.query.select: '',
         sort: (req.query.sort)?req.query.sort: '',
         //populate: 'author',
         //lean: true,
         page: (req.query.page)?Number(req.query.page): 1,
         limit: (req.query.limit)?Number(req.query.limit): 20
       };

     Image.paginate(findMatch, options, function(err, result) {
       if (err) {
               console.log(err);
               return next(err);
      }
      res.json( {
                 "count": result.total,
                 "page":result.page,
                 "limit":result.limit,
                 "pages":result.pages,
                 "images": result.docs
        });
       console.log("Total Results: " + result.total);
     });
});

Image.register(router,'/images');
// Image.register(router,'/images');


// Return router
module.exports = router;
