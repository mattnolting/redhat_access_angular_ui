angular.module('RedhatAccess.security', ['ui.bootstrap'])
.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})
.directive('loginStatus', function() {
    return {
        restrict: 'AE',
        scope: false,
        templateUrl: 'security/login_status.html'
    };
})
.controller('SecurityController', ['$scope','$rootScope', 'securityService','AUTH_EVENTS',
    function($scope,$rootScope, securityService, AUTH_EVENTS) {

        $scope.isLoggedIn = false;
        $scope.loggedInUser = '';

        strata.checkLogin(loginHandler);

        function loginHandler(result, authedUser) {

            if (result) {
                console.log("Authorized!");
                $scope.$apply(function() {
                    $scope.isLoggedIn = true;
                    //$scope.loggedInUser = securityService.getLoggedInUserName();
                    $scope.loggedInUser = authedUser.name
                });
            } else {
                $scope.$apply(function() {
                    $scope.isLoggedIn = false;
                    $scope.loggedInUser = '';
                });
            }
        };

        $scope.login = function() {
            securityService.login().then(function(authedUser) {
                if (authedUser) {
                    $scope.isLoggedIn = true;
                    $scope.loggedInUser = authedUser.name;
                }
            });

        };

        $scope.logout = function() {
            strata.clearCredentials();
            $scope.isLoggedIn = false;
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        };


    }
])
.service('securityService', ['$modal',
    function($modal) {

        //bool isAuthed = false;

        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: 'security/login_form.html'
        };

        var modalOptions = {
            closeButtonText: 'Close',
            actionButtonText: 'OK',
            headerText: 'Proceed?',
            bodyText: 'Perform this action?',
            backdrop: 'static'
        };

        this.login = function() {
            return this.showLogin(modalDefaults, modalOptions);
        };

        this.getLoggedInUserName = function() {
            return strata.getAuthInfo().name;
        };

        this.showLogin = function(customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};
            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);
            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);
            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function($scope, $modalInstance) {
                    $scope.user = {
                        user: null,
                        password: null
                    };
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function(result) {
                        //console.log($scope.user);
                        strata.setCredentials($scope.user.user, $scope.user.password,
                            function(passed, authedUser) {
                                if (passed) {
                                    $scope.user.password = '';
                                    $modalInstance.close(authedUser);
                                } else {
                                    alert("Login failed!");
                                }
                            });

                    };
                    $scope.modalOptions.close = function() {
                        $modalInstance.dismiss();
                    };
                };
            }

            return $modal.open(tempModalDefaults).result;
        };

    }
]);