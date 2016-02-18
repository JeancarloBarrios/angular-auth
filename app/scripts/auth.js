angular.module('authApp', ['ngResource']).
    config(['$httpProvider','$resourceProvider', function($httpProvider, $resourceProvider){
        // django and angular both support csrf tokens. This tells
        // angular which cookie to add to what header.
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
        // Dont strip trailling slashes from calculated URLs
        $resourceProvider.defaults.stripTrailingSlashes = false;
    }]).
    factory('api', function($resource){
        function add_auth_header(data, headersGetter){
            // console.log("line 12:", data);
            // as per HTTP authentication spec [1], credentials must be
            // encoded in base64. Lets use window.btoa [2]
            var headers = headersGetter();
            // console.log("line 16:", headers);
            headers['Authorization'] = ('Basic ' + btoa(data.username +
                                        ':' + data.password));
            // console.log("line 19:", headers['Authorization']);
            // console.log("line 20", headers);
            // console.log("line 21", btoa(data.username))
        }
        // defining the endpoints. Note we escape url trailing dashes: Angular

        // strips unescaped trailing slashes. Problem as Django redirects urls
        // not ending in slashes to url that ends in slash for SEO reasons, unless
        // we tell Django not to [3]. This is a problem as the POST data cannot
        // be sent with the redirect. So we want Angular to not strip the slashes!

        return {
            auth: $resource('http://127.0.0.1:8000/auth/', {}, {
                login: {method: 'POST'},
                logout: {method: 'DELETE'}
            }),
        };
    }).
    controller('authController', function($scope, api) {
        // Angular does not detect auto-fill or auto-complete. If the browser
        // autofills "username", Angular will be unaware of this and think
        // the $scope.username is blank. To workaround this we use the
        // autofill-event polyfill [4][5]
        // $('#id_auth_form input').checkAndTriggerAutoFillEvent();

        this.getCredentials = function(){
            return {username: $scope.username, password: $scope.password};
        };

        this.login = function($resource){
            api.auth.login(this.getCredentials()).
                $promise.
                    then(function(data){
                        // on valid username and password
                        // console.log(data.username)
                        $scope.user = data.username;
                        console.log(data);
                    }).
                    catch(function(data){
                        // on invalid username and password
                        // alert(data.data.detail);
                        console.log("Cagadales");
                    });
        };

        this.logout = function(){
            api.auth.logout(function(){
                $scope.user = undefined;
            });
        };
    });
