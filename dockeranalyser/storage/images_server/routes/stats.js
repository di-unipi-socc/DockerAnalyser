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

/*
GET /stats/<KEY>/

example: stats of the key=stars_count.
GET /stats/stars_count/

{
    "images": X         // (int) total number of images with star_count not null
    "min": V            //min value of the KEY
    "max": Z            //max value of the key
    "average": G        // average value of the key
    "values": [{
        "value":"3",                      // value of the the key
        "type": "int"|"string"|"object"   // type of the key
        "tot": Y                       //(int) number of images with KEY=VALUE
    },
    {
        "value":"4",                      // value of the the key
        "type": "int"|"string"|"object"   // type of the key
        "tot": Z                      //(int) number of images with KEY=VALUE
    }
  ]
}
*/

router.get('/:key', function (req, res, next) {
    var vkey = req.params.key;
    var key = "$"+vkey;
    console.log(vkey + "stats ... ");
    var keyMatch ={};
    var addKey = { $addFields: {"key":vkey}};

    keyMatch[vkey]  ={ "$exists": true, "$ne": null };
    var matchNotNull = {$match: keyMatch};
    var MaxMin ={ "$group" : {
                    _id: null,
                    max:{$max:key},
                    min:{$min:key},
                    avg: { $avg: key },
                    count:{$sum:1}
                }};
    var groupCount = { "$group" : {"_id": key,  count:{$sum:1}} };


    Image.aggregate([matchNotNull, MaxMin, addKey], function(err, result1) {
          if (err) {
                  console.log(err);
                  return next(err);

          }


      Image.aggregate([matchNotNull, groupCount, { $addFields: { value: "$_id" }},{$project: { _id: 0 } }], function(err2, result2) {
            if (err2) {
                    console.log(err);
                    return next(err);

            }
            if(result1 === undefined || result1.length == 0) {
                // array empty or does not exist
                res.json({"value":[], "msg":"No matching "+vkey+" keys found"});
            }else{
              let data = result1[0];
              data['values'] = result2;
              res.json(data);
            }

      });
    });
});

// Return router
module.exports = router;
