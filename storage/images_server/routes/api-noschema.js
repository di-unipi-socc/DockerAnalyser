// Dependencies
"use strict";
var express = require('express');
var router = express.Router();
var Image = require('../models/image-noschema');

// record all the methods
Image.methods(['get','put','post','delete']).updateOptions({ new: true });

// router.get('/', function(req, res, next) {
//   console.log("called schema less image")
//   console.log("GET " + req.originalUrl);
//
//   // query for retrieve the images with binary name and versions
//   var findMatch = {'data': {$all: []}};
//
//   for (var key in req.query) {
//     console.log(key)
//     findMatch.data.$all.push({$elemMatch: {key: req.query[key]}});
//   }
//
//   //  execution of the query
//   queryBuild.exec(function (err, results) {
//       if (err) {
//           console.log(err);
//           return next(err);
//       }
//
//       //console.log(JSON.stringify(img, null, 4));
//       //console.log("After limit:" + count);
//       //res.json({"count": /*number of images that sadisfy the query*/results.length, "images": results});
//       res.json({"count": results.length, "images": results});
//       console.log("Results " + results.length)
//
//   });
//
// });



Image.register(router,'/');

// Return router
module.exports = router;
