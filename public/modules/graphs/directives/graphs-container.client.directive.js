'use strict';

angular.module('graphs').directive('graphsContainer', GraphsContainerDirective);

function GraphsContainerDirective () {

  var directive = {
    restrict: 'EA',
    templateUrl: 'modules/graphs/directives/graphs-container.client.view.html',
    controller: GraphsContainerDirectiveController,
    controllerAs: 'vm'
  };

  return directive;

  /* @ngInject */
  function GraphsContainerDirectiveController ($scope, $state, $stateParams, Products, Dashboards, $filter, $rootScope, TestRuns, Metrics, Tags, $q, $timeout, Utils) {

    var vm = this;


    /* Releative interval options in live graphs */
    vm.zoomOptions = [
      {value: '-10min' , label: 'Last 10 minutes'},
      {value: '-30min' , label: 'Last 30 minutes'},
      {value: '-1h', label: 'Last hour'},
      {value: '-3h', label: 'Last 3 hours'},
      {value: '-6h', label: 'Last 6 hours'},
      {value: '-12h', label: 'Last 12 hours'},
      {value: '-1d', label: 'Last day'},
      {value: '-2d', label: 'Last 2 days'},
      {value: '-3d', label: 'Last 3 days'}
    ];

    /* Get deeplink params from query string */

    /* If graph has been zoomed */
    if ($state.params.zoomFrom)
      Utils.zoomFrom = $state.params.zoomFrom;

    if ($state.params.zoomUntil)
      Utils.zoomUntil = $state.params.zoomUntil;

    /* get zoomRange for live graphs*/
    if ($state.params.zoomRange){
      vm.selectedZoomOptionIndex = vm.zoomOptions.map(function(zoomOption){return zoomOption.value;}).indexOf($state.params.zoomRange);
      vm.zoomRange = vm.zoomOptions[vm.selectedZoomOptionIndex];
    }else{
      vm.zoomRange = Utils.zoomRange;
      /* set md-select selected item */
      vm.selectedZoomOptionIndex = vm.zoomOptions.map(function(zoomOption){return zoomOption.value;}).indexOf(vm.zoomRange.value);
    }

    /* get metricFilter */
    if ($state.params.metricFilter) {
      vm.metricFilter = $state.params.metricFilter;
      vm.metricFilterInput = $state.params.metricFilter;
      Utils.metricFilter = $state.params.metricFilter;
    }else{
      vm.metricFilter = Utils.metricFilter;
    }

    /* get selectedSeries */
    if ($state.params.selectedSeries) {
      vm.selectedSeries = $state.params.selectedSeries;
      Utils.selectedSeries = $state.params.selectedSeries;
    }else{
      vm.selectedSeries = Utils.selectedSeries;
    }

    /* Get selected series params from query string */

    //Utils.selectedSeries = ($state.params.selectedSeries) ? decodeURIComponent($state.params.selectedSeries) : '';

    /* Get metricFilter params from query string */

    //Utils.metricFilter = ($state.params.metricFilter) ? decodeURIComponent($state.params.metricFilter) : '';

    /* get value form statParams */
    //vm.value = $stateParams.tag;

    vm.productName = $stateParams.productName;
    vm.dashboardName = $stateParams.dashboardName;

    vm.gatlingDetails = $stateParams.tag === 'Gatling' ? true : false;


    //vm.value = $stateParams.tag;
    vm.numberOfColumns = Utils.numberOfColumns;
    vm.flex = 100 / vm.numberOfColumns;
    vm.showLegend = Utils.showLegend;
    vm.showTooltip = Utils.showTooltip;
    vm.zoomLock = Utils.zoomLock;
    vm.metricFilter = Utils.metricFilter;
    vm.showViewUrl = false;
    vm.graphsType = $state.includes('viewGraphs') ? 'testrun' : 'graphs-live';


    vm.toggleLegend = toggleLegend;
    vm.toggleTooltip = toggleTooltip;
    vm.toggleNumberOfColums = toggleNumberOfColums;
    vm.isActive = isActive;
    vm.resetZoom = resetZoom;
    vm.clipClicked = clipClicked;
    vm.drilldownToMetric = drilldownToMetric;
    vm.setViewShareUrl = setViewShareUrl;
    vm.switchTag = switchTag;
    vm.setMetricFilter = setMetricFilter;
    vm.clearMetricFilter = clearMetricFilter;


    activate();


    /* initialize menu */

    var originatorEv;
    vm.openMenu = function ($mdOpenMenu, ev) {
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    $scope.$on('$destroy', function () {
      /* reset metricFilter when leaving graphs view */
      Utils.metricFilter = '';
    });


    ///* watch showLegend*/
    //$scope.$watch(function (scope) {
    //  return Utils.showLegend;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //
    //    vm.showLegend =  Utils.showLegend;
    //  }
    //});
    //
    ///* watch showTooltip*/
    //$scope.$watch(function (scope) {
    //  return Utils.showTooltip;
    //}, function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //
    //    vm.showTooltip =  Utils.showTooltip;
    //  }
    //});

    /* watch metricFilter */
    //$scope.$watch('vm.metricFilter', function (newVal, oldVal) {
    //  if (newVal !== oldVal) {
    //
    //    $timeout(function(){
    //      vm.metrics = filterOnTag(Dashboards.selected.metrics);
    //      vm.filteredMetrics  = filterOnMetricFilter(vm.metrics);
    //      populateColumns();
    //    });
    //  }
    //});



    /* watch zoomRange */
    $scope.$watch('vm.zoomRange', function (newVal, oldVal) {
      //if (newVal !== oldVal) {
      Utils.zoomRange = vm.zoomRange;
      //}
    });

    /* watch zoomLock */
    $scope.$watch('vm.zoomLock', function (newVal, oldVal) {
      if (newVal !== oldVal) {
        Utils.zoomLock = newVal;
      }
    });

    function activate(){




      Dashboards.get($stateParams.productName, $stateParams.dashboardName).success(function (dashboard) {


          vm.dashboard = Dashboards.selected;

          /* Get tags used in metrics */
          vm.tags = Tags.setTags(Dashboards.selected.metrics, $stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId, Dashboards.selected.tags);

          /* if reloading a non-existing tag is in $statParams */
          vm.value = checkIfTagExists($stateParams.tag) ? $stateParams.tag : 'All';

          vm.metrics = filterOnTag(Dashboards.selected.metrics);

          vm.filteredMetrics  = vm.metricFilter !=='' ? filterOnMetricFilter(vm.metrics) : vm.metrics;

          populateColumns();

        $timeout(function(){

          vm.selectedIndex = Tags.getTagIndex(vm.value, vm.tags);

        })


        if ($stateParams.testRunId) {
          TestRuns.getTestRunById($stateParams.productName, $stateParams.dashboardName, $stateParams.testRunId).success(function (testRun) {
            TestRuns.selected = testRun;
            vm.testRun = testRun;
          });
        }
      });

    }

    function populateColumns(){


        vm.columnsArray = [];

        var itemsPerColumn = Math.ceil(vm.filteredMetrics.length / vm.numberOfColumns);

        //Populates the column array
        for (var i = 0; i < vm.filteredMetrics.length; i += itemsPerColumn) {
          var col = {start: i, end: Math.min(i + itemsPerColumn, vm.filteredMetrics.length)};
          vm.columnsArray.push(col);
        }


    }

    /* Set active tab */
    function isActive(tag) {
      return vm.value === tag;
    };

    function toggleNumberOfColums(numberOfColumns){

      switch(numberOfColumns){

        case 1:

          vm.numberOfColumns = 1;
          vm.flex = 100 / vm.numberOfColumns;
          Utils.showLegend = true;
          break;

        case 2:

          vm.numberOfColumns = 2;
          vm.flex = 100 / vm.numberOfColumns;
          Utils.showLegend = true;
          break;

        case 3:

          vm.numberOfColumns = 3;
          vm.flex = 100 / vm.numberOfColumns;
          Utils.showLegend = false;
          break;
      }

      Utils.numberOfColumns = vm.numberOfColumns;
      activate();

    }



    function toggleLegend(){

      if(vm.showLegend === true) {
        vm.showLegend = false;
        Utils.showLegend = false;
      }else {
        vm.showLegend = true;
        Utils.showLegend = true;
      }
    }

    function toggleTooltip(){

      if(vm.showTooltip === true) {
        vm.showTooltip = false;
        Utils.showTooltip = false;
      }else {
        vm.showTooltip = true;
        Utils.showTooltip = true;
      }
    }

    function filterOnMetricFilter(metrics){

      if (vm.metricFilter === ''){

        return metrics;

      }else {
        var filteredMetrics = [];
        var metricFilterRegExp = new RegExp(vm.metricFilter, 'i');


        _.each(metrics, function (metric) {

          /* see if alias matches metricFilter */
          if (metricFilterRegExp.test(metric.alias)) {

            metric.isOpen = true;
            filteredMetrics.push(metric);

          } else {
            /* if not, check if tags match*/
            for (var i = 0; i < metric.tags.length; i++) {

              if (metricFilterRegExp.test(metric.tags[i].text)) {
                metric.isOpen = true;
                filteredMetrics.push(metric);
                break;
              }

            }
          }

        });

        return filteredMetrics;
      }
    }

    function setMetricFilter(){

      vm.metricFilter = vm.metricFilterInput;
      activate();



    }

    function clearMetricFilter (){

      vm.metricFilter = '';
      vm.metricFilterInput = '';
      activate();
    };

    function checkIfTagExists(tag) {
      var exists = false;
      _.each(vm.tags, function (existingTag) {
        if (tag === existingTag.text) {
          exists = true;
          return;
        }
      });
      return exists;
    }

    function filterOnTag(metrics) {

      var filteredMetrics = [];


      _.each(metrics, function(metric) {

        /* if tab is 'All', don't filter, but don't show the graphs */

        if(vm.value === 'All'){

          metric.isOpen = false;
          filteredMetrics.push(metric)

        }else{

          _.each(metric.tags, function (tag) {

            if (tag.text === vm.value) {

                metric.isOpen = true;
                filteredMetrics.push(metric);

            }

          });
        }


      });

      return filteredMetrics;
    }

    function resetZoom() {
      /*reset zoom*/
      Utils.zoomFrom = '';
      Utils.zoomUntil = '';
      //$state.go($state.current, {}, { reload: true });
    };


    
    /* generate deeplink to share view */

    function setViewShareUrl(graphsType) {

      switch(graphsType){

        case 'graphs-live':
          vm.viewShareUrl = 'http://' + location.host + '/#!/graphs-live/' + $stateParams.productName + '/' + $stateParams.dashboardName +  '/' + $stateParams.tag +  '/?zoomRange=' + Utils.zoomRange.value;
          break;
        case 'testrun':
          vm.viewShareUrl = 'http://' + location.host + '/#!/graphs/' + $stateParams.productName + '/' + $stateParams.dashboardName + '/' + $stateParams.testRunId + '/' + $stateParams.tag +  '/';

      }

      /* add trailing ? */
      if (Utils.zoomFrom || $state.params.selectedSeries || Utils.metricFilter || Utils.zoomRange !== '-10min') {
        vm.viewShareUrl = vm.viewShareUrl + '?';
      }
      
      /* if graph(s) has been zoomed */
      if (Utils.zoomFrom && graphsType == 'testrun') {
        vm.viewShareUrl = vm.viewShareUrl + '&zoomFrom=' + Utils.zoomFrom + '&zoomUntil=' + Utils.zoomUntil;
      }

     /* live graphs zoom range */
      if (Utils.zoomRange && graphsType == 'graphs-live') {
        vm.viewShareUrl = vm.viewShareUrl + '&zoomRange=' + Utils.zoomRange;
      }

      /* if specific serie hase been selected */
      if ($state.params.selectedSeries && graphsType == 'testrun') {
        vm.viewShareUrl = vm.viewShareUrl + '&selectedSeries=' + $state.params.selectedSeries;
      }

      /* if specific metric has been selected */
      if (Utils.metricFilter !== '') {
        vm.viewShareUrl = vm.viewShareUrl + '&metricFilter=' + encodeURIComponent(Utils.metricFilter)
      }

      if (vm.showViewUrl) {
        switch (vm.showViewUrl) {
          case true:
            vm.showViewUrl = false;
            break;
          case false:
            vm.showViewUrl = true;
            break;
        }
      } else {
        vm.showViewUrl = true;
      }
    };

    function hasFlash() {
      var hasFlash = false;
      try {
        var fo = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        if (fo) {
          hasFlash = true;
          return hasFlash;
        }
      } catch (e) {
        if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] != undefined && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
          hasFlash = true;
          return hasFlash;
        }
      }
    };

    /* Zero copied logic */
     function clipClicked() {
      vm.showViewUrl = false;
    };

    function drilldownToMetric(metric){

      vm.metricFilter = metric.alias;
      vm.numberOfColumns = 1;
      Utils.numberOfColumns = vm.numberOfColumns;
      activate();
    }

    function switchTag(route) {

      Utils.metricFilter = '';

      switch(vm.graphsType){

        case 'testrun':

          //route.testRunId = vm.testRun.testRunId;

          $state.go('viewGraphs', route);
          break;

        case 'graphs-live':

          $state.go('viewLiveGraphs', route);


      }
    };
  }
}