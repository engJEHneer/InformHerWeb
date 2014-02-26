angular.module('informher.controllers', [])
    .controller('AuthCtrl', function($scope, UserService, ApiService) {
        $scope.registrationSuccessful = false;

        $scope.message = {
            displayed: false,
            title: {
                content: '',
                color: {
                    bg: 'dark',
                    fg: 'stable'
                }
            },
            body: {
                content: '',
                color: {
                    bg: 'stable',
                    fg: 'dark'
                }
            },
            border: 'dark'
        };

        $scope.displayMessage = function(body, title, bg, fg) {
            $scope.message = {
                displayed: true,
                title: {
                    content: title,
                    color: {
                        bg: fg,
                        fg: bg
                    }
                },
                body: {
                    content: body,
                    color: {
                        bg: bg,
                        fg: fg
                    }
                },
                border: fg
            }
        };

        $scope.displayInformationMessage = function(body, title) {
            $scope.displayMessage(body, title);
        };

        $scope.displayErrorMessage = function(body, title) {
            $scope.displayMessage(body, title, 'stable', 'assertive');
        };

        $scope.dismissMessage = function() {
            $scope.message = {
                displayed: false,
                title: '',
                body: '',
                bg: 'stable-bg',
                border: 'stable-border',
                fg: 'dark'
            };
        };

        $scope.doAuth = function(authType) {
            $scope.dismissMessage();
            var queries = {
                    'login': {
                        'path': '/user/login',
                        'method': 'post',
                        'body': {
                            'username': $scope.input.username,
                            'password': $scope.input.password,
                            'remember': $scope.input.remember
                        }
                    },
                    'register': {
                        'path': '/user',
                        'method': 'post',
                        'body': {
                            'username': $scope.input.username,
                            'email': $scope.input.email,
                            'password': $scope.input.password,
                            'password_confirmation': $scope.input.passwordConfirmation
                        }
                    },
                    'logout': {
                        'path': '/user/logout',
                        'method': 'get'
                    }
                }, query = queries[authType];

            if(authType == 'register') {
                switch(!false) {
                    case !($scope.input.username != ''):
                        $scope.displayErrorMessage('Invalid username', 'Error: ERR_INVALID_USERNAME');
                        return;
                    case !($scope.input.email != ''):
                        $scope.displayErrorMessage('Invalid email address', 'Error: ERR_INVALID_EMAIL_ADDRESS');
                        return;
                    case !($scope.input.password.length >= 6):
                        $scope.displayErrorMessage('Password cannot be shorter than 6 characters', 'Error: ERR_INVALID_PASSWORD');
                        return;
                    case !($scope.input.password == $scope.input.passwordConfirmation):
                        $scope.displayErrorMessage('Passwords do not match', 'Error: ERR_PASSWORDS_DO_NOT_MATCH');
                        return;
                }
            }

            console.log('a');
            var request = ApiService.getResponse(query.method, query.path, query.body || {})
                .success(function(response) {
                    switch(authType) {
                        case 'login':
                            UserService.setLoggedUser(response.user.id);
                            break;
                        case 'register':
                            $scope.registrationSuccessful = true;
                            $scope.displayInformationMessage(response.description, "Message: " + response.status);
                            break;
                        case 'logout':
                            UserService.setLoggedUser(null);
                            break;
                        default:
                            console.log('Unknown auth type ' + authType);
                    }
                    console.log(response);
                })
                .error(function(response) {
                    $scope.displayErrorMessage(response.description, "Error: " + response.status);
                    console.log(response);
                });
        };

        $scope.reset = function() {
            $scope.input = {
                username: '',
                email: '', // for register only
                password: '',
                passwordConfirmation: '', // for register only
                remember: false, // for login only
                agree: false // for register only
            };
            $scope.registrationSuccessful = false;
        };

        $scope.reset();
    })
;