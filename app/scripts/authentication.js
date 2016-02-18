/**
* Authentication
* @namespace Base angular auth service
*/
angular.module('authApp', ['ngResource']).
  config(['$httpProvider','$resourceProvider', function($httpProvider, $resourceProvider){
      // django and angular both support csrf tokens. This tells
      // angular which cookie to add to what header.
      $httpProvider.defaults.xsrfCookieName = 'csrftoken';
      $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
      // Dont strip trailling slashes from calculated URLs
      $resourceProvider.defaults.stripTrailingSlashes = false;
      // $httpProvider.interceptors.push('authInterceptor');

  }]).controller('authController', function($scope, $http, $window) {
    // Controller for auth authApp
    $scope.isAuthenticated = false;
    $scope.message="";

    this.getCredentials = function(){
      return {username: $scope.username, password: $scope.password};
    };

    this.submit = function() {
      $http
        .post('http://127.0.0.1:8000/auth/', $scope.username)
        .success(function(data, status, headers, config){
          $window.sessionStorage.token = data.token;
          $scope.isAuthenticated = true;
          $scope.message ="OK";
        })
        .error(function(data, status, headers, config){
          // Deleate the token if the user fails to log in
          // deleate $window.sessionStorage.token;
          // Handle log in errors here
          $scope.message = "Error: invalid user opr password";
        });
    };
  }).
  facotry('authInterceptor', function($rootScope, $q, $window) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if ($window.sessionStorage.token) {
        config.headers.Authorization = 'Bearer' + $window.sessionStorage.token;
      }
      return config;
    },
    response: function (response) {
      if (response.status === 401){
          // Handle the case where the user is not authenticated
      }
      return response || $q.when(response);
    }
  };

});
