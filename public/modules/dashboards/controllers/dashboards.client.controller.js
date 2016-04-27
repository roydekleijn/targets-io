'use strict';
// Dashboards controller
angular.module('dashboards').controller('DashboardsController', [
  '$scope',
  '$rootScope',
  '$modal',
  '$log',
  '$stateParams',
  '$state',
  '$location',
  'ConfirmModal',
  'Dashboards',
  'Products',
  'Metrics',
  'TestRuns',
  'SideMenu',
  'Templates',
  'Events',
  'Utils',
  '$q',
  function ($scope, $rootScope, $modal, $log, $stateParams, $state, $location, ConfirmModal, Dashboards, Products, Metrics, TestRuns, SideMenu, Templates, Events, Utils, $q) {

    $scope.productName = $stateParams.productName;
    $scope.dashboardName = $stateParams.dashboardName;


    /* Get all dashboard names for product */

  //  Dashboards.getDashboardsForProduct($stateParams.productName).success(function(dashboards){
  //
  //    $scope.dashboardsForProduct = dashboards;
  //
  //  });
  //
  //  $scope.copyMetricsToDashboard = function(dashboard){
  //
  //    var copyMetricArrayOfPromises = [];
  //
  //    _.each($scope.dashboard.metrics, function(metric){
  //
  //      if(metric.selected === true){
  //        var metricClone = _.clone(metric);
  //
  //        metricClone.dashboardId = dashboard._id;
  //        metricClone.dashboardName = dashboard.name;
  //        metricClone._id = undefined;
  //
  //
  //        copyMetricArrayOfPromises.push(Metrics.create(metricClone));
  //        metric.selected = false;
  //        $scope.metricSelected = false;
  //
  //      }
  //
  //    })
  //
  //
  //    $q.all(copyMetricArrayOfPromises)
  //        .then(function () {
  //          $state.go('viewDashboard', {
  //            productName: $stateParams.productName,
  //            dashboardName: dashboard.name
  //          });
  //        });
  //
  //
  //  }
  //
  ///* Get templates */
  //
  //  Templates.getAll().success(function(templates){
  //
  //    $scope.templates = templates;
  //
  //  });
  //
  //
  //
  //  $scope.editMetric = function(metricId){
  //
  //    $state.go('editMetric',{productName: $stateParams.productName, dashboardName: $stateParams.dashboardName, metricId: metricId });
  //
  //  }
  //
  //  $scope.clearMetricFilter = function(){
  //
  //    $scope.filterMetrics = '';
  //
  //  };
  //
  //
  //
  //  $scope.mergeTemplate = function(index){
  //
  //      Templates.selected = $scope.templates[index];
  //      $state.go('mergeTemplate');
  //  };

    if(Dashboards.selected !== {}) {

      $scope.dashboard = Dashboards.selected;
      $scope.showBenchmarks = Dashboards.selected.useInBenchmark;

      if (Dashboards.selected.productName !== $stateParams.productName || Dashboards.selected.name !== $stateParams.dashboardName) {

        /* reset all test run related state */
        TestRuns.list = [];
        TestRuns.runningTest = '';
        TestRuns.numberOfRunningTests = '';
        //Utils.reset();
        //Utils.zoomFrom = '';
        //Utils.zoomUntil = '';

        Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {
          $scope.dashboard = Dashboards.selected;
          $scope.showBenchmarks = Dashboards.selected.useInBenchmark;
        });
      }
    }else{
      if($stateParams.dashboardName) {
        Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {
          $scope.dashboard = Dashboards.selected;
          $scope.showBenchmarks = Dashboards.selected.useInBenchmark;
        });
      }
    }

    $scope.$watch(function (scope) {
      return Dashboards.selected._id;
    }, function (newVal, oldVal) {
      if (newVal !== oldVal) {
        $scope.dashboard = Dashboards.selected;
        $scope.showBenchmarks = Dashboards.selected.useInBenchmark;
        Products.get($stateParams.productName).success(function (product) {
          Products.selected = product;
          //$scope.loading = true;
          //TestRuns.listTestRunsForDashboard($scope.productName, $scope.dashboardName, Dashboards.selected.useInBenchmark).success(function (testRuns) {
          //  $scope.loading = false;
          //  TestRuns.list = testRuns;
          //  $scope.testRuns = testRuns;
          //});
        });
      }
    });


    //$scope.$watch(function () {
    //  $scope.filteredMetrics = $scope.$eval("dashboard.metrics | filter:filterMetrics");
    //});
    //
    //
    //$scope.$watch('allMetricsSelected', function (newVal, oldVal) {
    //    if (newVal !== oldVal) {
    //      _.each($scope.filteredMetrics, function (metric, i) {
    //        metric.selected = newVal;
    //      });
    //    }
    //});

    //$scope.setMetricsSelected = function(metricSelected){
    //
    //    if (metricSelected === false){
    //
    //      $scope.metricSelected = false;
    //
    //      _.each($scope.dashboard.metrics, function(metric){
    //          if(metric.selected === true) $scope.metricSelected = true;
    //      })
    //
    //    }else {
    //      $scope.metricSelected = metricSelected;
    //    }
    //};
    //
    //$scope.setAllMetricsSelected = function(metricSelected){
    //
    //  $scope.metricSelected = metricSelected;
    //};


    /* Tab controller */
    $scope.$watch(function (scope) {
      return Dashboards.selectedTab;
    }, function () {
      $scope.selectedIndex = Dashboards.selectedTab;
    });

    $scope.setTab = function (newValue) {
      Dashboards.selectedTab = newValue;
    };

    ///* Watch on dashboard */
    //$scope.$watch(function (scope) {
    //  return Dashboards.selected;
    //}, function (newVal, oldVal) {
    //  $scope.dashboard = Dashboards.selected;
    //  SideMenu.productFilter = $stateParams.productName;
    //
    //});

    //$scope.authentication = Authentication;
    //$scope.addMetric = function () {
    //  //            console.log('add/metric/' + $stateParams.productName + '/' + $stateParams.dashboardName)
    //  $state.go('addMetric', {
    //    'productName': $stateParams.productName,
    //    'dashboardName': $stateParams.dashboardName
    //  });
    //};

    // Create new Dashboard
    $scope.create = function () {
      // Create new Dashboard object
      //var dashboard = {};
      //dashboard.name = this.name;
      //dashboard.description = this.description;
      //dashboard.useInBenchmark = this.useInBenchmark;
      Dashboards.create($scope.dashboard, $stateParams.productName).success(function (dashboard) {
        /* Refresh sidebar */

        Dashboards.selected = dashboard;

        Products.fetch().success(function (products) {

          Products.items = products;

          $scope.products = products;


          SideMenu.addProducts(products);

            /* reset Test runs*/
          TestRuns.list = [];

          $state.go('viewDashboard', {
            productName: $stateParams.productName,
            dashboardName: Dashboards.selected.name
          });

          $scope.dashboardForm.$setPristine();  //

        });
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };


    // Update existing Dashboard
    $scope.update = function () {
      Dashboards.update($scope.dashboard).success(function (dashboard) {

        Dashboards.selected = dashboard;

        TestRuns.updateAllTestRunsForDashboard($state.params.productName, $state.params.dashboardName, dashboard.name).success(function(testruns) {

          TestRuns.list = testruns;

          Events.updateAllEventsForDashboard($state.params.productName, $state.params.dashboardName, dashboard.name).success(function (events) {

            Events.list = events;

            /* Refresh sidebar */
            Products.fetch().success(function (products) {

              Products.items = products;

              $scope.products = products;

              $state.go('viewDashboard', {
                'productName': $stateParams.productName,
                'dashboardName': $scope.dashboard.name
              });
            });

          });
        });
      });
    };


    $scope.init = function () {
      /* reset form*/
      //$scope.dashboardForm.$setPristine();
      $scope.dashboard = {};
      Dashboards.selected = {};
    };
    $scope.cancel = function () {
      /* reset form*/
      $scope.dashboardForm.$setPristine();
      if ($rootScope.previousStateParams)
        $state.go($rootScope.previousState, $rootScope.previousStateParams);
      else
        $state.go($rootScope.previousState);
    };

    //$scope.openDeleteMetricModal = function (size, index) {
    //  Metrics.selected = $scope.dashboard.metrics[index];
    //  ConfirmModal.itemType = 'Delete metric ';
    //  ConfirmModal.selectedItemId = Metrics.selected._id;
    //  ConfirmModal.selectedItemDescription = Metrics.selected.alias;
    //  var modalInstance = $modal.open({
    //    templateUrl: 'ConfirmDelete.html',
    //    controller: 'ModalInstanceController',
    //    size: size  //,
    //  });
    //  modalInstance.result.then(function () {
    //    Metrics.delete(Metrics.selected._id).success(function (metric) {
    //      /* refresh dashboard*/
    //      Dashboards.get($scope.productName, $scope.dashboardName).success(function (dashboard) {
    //        $scope.dashboard = Dashboards.selected;
    //      });
    //    });
    //  }, function () {
    //    $log.info('Modal dismissed at: ' + new Date());
    //  });
    //};


    //$scope.openDeleteSelectedMetricsModal = function (size) {
    //
    //  ConfirmModal.itemType = 'Delete ';
    //  ConfirmModal.selectedItemId = '';
    //  ConfirmModal.selectedItemDescription = 'selected metrics';
    //  var modalInstance = $modal.open({
    //    templateUrl: 'ConfirmDelete.html',
    //    controller: 'ModalInstanceController',
    //    size: size  //,
    //  });
    //  modalInstance.result.then(function () {
    //    var deleteMetricArrayOfPromises = [];
    //    var i;
    //
    //    for(i = $scope.dashboard.metrics.length -1; i > -1; i--){
    //
    //      if($scope.dashboard.metrics[i].selected === true){
    //        deleteMetricArrayOfPromises.push(Metrics.delete($scope.dashboard.metrics[i]._id));
    //        $scope.dashboard.metrics[i].selected = false;
    //        $scope.metricSelected = false;
    //        $scope.dashboard.metrics.splice(i,1);
    //      }
    //    }
    //
    //
    //    $q.all(deleteMetricArrayOfPromises)
    //      .then(Dashboards.get($scope.productName, $scope.dashboardName))
    //      .then(function (dashboard) {
    //              $scope.allMetricsSelected = false;
    //              $scope.dashboard = Dashboards.selected;
    //      });
    //
    //  }, function () {
    //    $log.info('Modal dismissed at: ' + new Date());
    //  });
    //
    //};

  }
]);
