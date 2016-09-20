 'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'), Schema = mongoose.Schema,
    config = require('../../config/config');
/**
 * Product Schema
 */
var ProductSchema = new mongoose.Schema({
  'name': {
    type: String,
    uppercase: true
  },
  'description': String,
   'markDown': {
        type: String,
        default: ''
    },
    'jenkinsHost':{
        type: String,
        default: config.jenkinsHost
    },
   'dashboards': [{
      type: Schema.Types.ObjectId,
      ref: 'Dashboard'
    }],
  'requirements': [ {
      'stakeholder': String,
      'description': String,
      'relatedDashboards': [ String ],
      'result':{
          type: Boolean,
          default: false
      }
  } ]
},
    {
        read: 'primary',
        safe: {w: 'majority', j: true, wtimeout: 5000} // 2 replicas and 5 seconds timeout from replica
    });
ProductSchema.index({ name: 1 }, { unique: true });
mongoose.model('Product', ProductSchema);
