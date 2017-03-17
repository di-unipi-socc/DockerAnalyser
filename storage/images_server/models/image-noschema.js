"use strict"
var restful = require('node-restful')
var mongoose = restful.mongoose;
var mongoosePaginate = require('mongoose-paginate');


var imageSchema =  new mongoose.Schema({
  //name of the image
  // name : { // <repo:tag> the name id composed by  <repository name:tag>
  //     type:       String,
  //     unique:     true,
  //     //required    :[true, 'The name of the image cannot be empty']
  // },
  //description associated with the image
 //  description: mongoose.Schema.Types.Mixed  // key:value
},{"strict":false});

imageSchema.plugin(mongoosePaginate);

// Return a model
module.exports = restful.model("Images-noschema",imageSchema);
