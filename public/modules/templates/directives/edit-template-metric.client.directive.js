'use strict';

angular.module('templates').directive('editTemplateMetric', EditTemplateMetricDirective);

function EditTemplateMetricDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/templates/directives/edit-template-metric.client.view.html',
    controller: EditTemplateMetricDirectiveController
  };

  return directive;

  /* @ngInject */
  function EditTemplateMetricDirectiveController ($scope, $rootScope, $state, Templates, Dashboards, Utils) {


      $scope.addCustomUnit = addCustomUnit;
      $scope.addTarget = addTarget;
      $scope.removeTarget = removeTarget;
      $scope.loadTags = loadTags;
      $scope.update = update;
      $scope.clone = clone;
      $scope.cancel = cancel;


      /* Watches */

      /* watch benchmark and requirement toggles */

      $scope.$watch('enableRequirement', function (newVal, oldVal) {
          if (newVal !== oldVal) {
              if ($scope.enableRequirement === false) {
                  $scope.metric.requirementOperator = null;
                  $scope.metric.requirementValue = null;
              }
          }
      });
      $scope.$watch('enableBenchmarking', function (newVal, oldVal) {
          if (newVal !== oldVal) {
              if ($scope.enableBenchmarking === false) {
                  $scope.metric.benchmarkOperator = null;
                  $scope.metric.benchmarkValue = null;
              }
          }
      });


      /* activate */

      activate();

      /* functions */

      function activate() {

          $scope.metric = Templates.metric;

          /* values for form drop downs*/
          $scope.metricTypes = [
              'Average',
              'Maximum',
              'Minimum',
              'Last',
              'Gradient'
          ];

          $scope.metricUnits = [
              'None',
              'Count',
              'Errors',
              'Mb',
              'Milliseconds',
              'Percentage',
              'Responses',
              'Bytes/second',
              'CPUsec',
              'Users',
              'Custom'
          ];

          /* if metric has custom unit, add it to the select list */

          if ($scope.metricUnits.indexOf($scope.metric.unit) === -1) {
              $scope.metricUnits.unshift($scope.metric.unit);
          }

          /* set benchmark and requirement toggles */
          if ($scope.metric.requirementValue)
              $scope.enableRequirement = true;
          if ($scope.metric.benchmarkValue)
              $scope.enableBenchmarking = true;

      }

      function addCustomUnit(){

          $scope.metricUnits.push($scope.metric.customUnit)
          $scope.metric.unit = $scope.metric.customUnit;

      }


      function addTarget() {
          $scope.metric.targets.push('');
          $scope.graphiteTargets = $scope.defaultGraphiteTargets;
      };

      function removeTarget(index) {
          $scope.metric.targets.splice(index, 1);
      };
      function loadTags(query) {

          var matchedTags = [];
          _.each(Templates.selected.tags, function (tag) {
              if (tag.text.toLowerCase().match(query.toLowerCase()))
                  matchedTags.push(tag);
          });
          return matchedTags;
      };


      function update(){

            /* sort tags */
          if($scope.metric.tags.length > 1) $scope.metric.tags = $scope.metric.tags.sort(Utils.dynamicSort('text'));

          /* add tags */

          _.each($scope.metric.tags, function(tag){

              Templates.selected.tags.push(tag);

          });

          Templates.selected.tags = _.uniq(Templates.selected.tags, 'text');


            //var updateIndex = Templates.selected.metrics.map(function(metric) { return metric._id.toString(); }).indexOf('$scope.metric._id.toString()');
            //Templates.selected.metrics[updateIndex] = $scope.metric;
            Templates.update(Templates.selected).success(function (template){
                Templates.selected = template;
                Templates.selected.selectedIndex = 1;
                $state.go('viewTemplate',{templateName: template.name});
            });
      }

      function clone() {
          //$scope.metric._id = undefined;
          //var cloneIndex = Templates.selected.metrics.map(function(metric) { return metric._id.toString(); }).indexOf('$scope.metric._id.toString()');
          Templates.metricClone = _.cloneDeep($scope.metric);
          delete  Templates.metricClone['_id'];

          $state.go('addTemplateMetric');
      };

      function cancel() {
          if ($rootScope.previousStateParams)
              $state.go($rootScope.previousState, $rootScope.previousStateParams);
          else
              $state.go($rootScope.previousState);
      };


  }
}
