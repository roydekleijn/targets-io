'use strict';
// Setting up route
angular.module('core', ['dashboards']).config([
  '$stateProvider',
  '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {
    // Redirect to home view when route not found
    $urlRouterProvider.otherwise('/');
    // Home state routing
    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'modules/core/views/home.client.view.html'
    })
    .state('gettingStarted', {
      url: '/getting-started',
      templateUrl: 'modules/core/views/getting-started.client.view.html'
    }).state('productMenu', {
      template: '<product-menu></product-menu>'
    }).state('dashboardMenu', {
      template: '<dashboard-menu></dashboard-menu>'
    }).state('targestIoHeader', {
      template: '<targets-io-header></targets-io-header>'
    });
  }
]);
