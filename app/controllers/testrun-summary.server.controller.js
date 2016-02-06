/*jshint maxerr: 10000 */
'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    TestrunSummary = mongoose.model('TestrunSummary'),
    _ = require('lodash'),
    Utils = require('./utils.server.controller');




exports.get = getTestrunSummary;
exports.create = createTestrunSummary;
exports.update = updateTestrunSummary;
exports.delete = deleteTestrunSummary;


function getTestrunSummary (req, res){

  TestrunSummary.findOne({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName },
      { testRunId: req.params.testRunId }
    ]
  }).exec(function (err, testRunSummary) {

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(testRunSummary);
    }
  })
}

function createTestrunSummary(req, res){

  var testRunSummary = new TestrunSummary(req.body);

  testRunSummary.save(function(err, savesTestRunSummary){

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(savesTestRunSummary);
    }
  })
}

function updateTestrunSummary(req, res){


    TestrunSummary.findOne({$and:[
      {productName: req.body.productName},
      {dashboardName: req.body.dashboardName},
      {testRunId: req.body.testRunId}
    ]}).exec(function(err, testRunSummary){

      if (err) {
        return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
      } else{

        testRunSummary.annotations = req.body.annotations;
        testRunSummary.metrics = req.body.metrics;

        testRunSummary.save(function(err, savedTestRunSummary){

          if (err) {
            return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
          } else {

            res.jsonp(savedTestRunSummary);

          }
        });
      }

    })

}

function deleteTestrunSummary (req, res){

  TestrunSummary.remove({
    $and: [
      { productName: req.params.productName },
      { dashboardName: req.params.dashboardName },
      { testRunId: req.params.testRunId }
    ]
  }).exec(function (err, testRunSummary) {

    if (err) {
      return res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    } else {
      res.jsonp(testRunSummary);
    }
  })

}
