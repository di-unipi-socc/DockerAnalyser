"use strict"
var restful = require('node-restful')
var mongoose = restful.mongoose;
var mongoosePaginate = require('mongoose-paginate');


var imageSchema =  new mongoose.Schema({},{"strict":false});

imageSchema.plugin(mongoosePaginate);

// Return a model
module.exports = restful.model("Images-noschema",imageSchema);
