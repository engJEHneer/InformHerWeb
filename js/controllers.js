angular.module('informher.controllers', [])
    .controller('LoginCtrl', function($translate, $scope, $state, $http, SessionService) {

        /* -------- *
         *  FIELDS  *
         * -------- */

        $scope.user = {
            name: '',
            pass: '',
            remember: false
        };

        /* --------- *
         *  METHODS  *
         * --------- */

        $scope.messageClass = 'card hidden';

        $scope.hideMessage = function() {
            $scope.messageClass = 'card hidden';
        };

        $scope.displayMessage = function(message, title, messageType) {
            $scope.messageClass = 'card';
            $scope.message = message;
            $scope.messageTitle = title;
            $scope.messageType = messageType;
        };

        $scope.submit = function() {
            $scope.hideMessage();
            console.log($scope.user.name, $scope.user.pass);
            $http.post('http://informherapi.azurewebsites.net/user/login', {
                    'username': $scope.user.name,
                    'password': $scope.user.pass
                }
            )
                .success(function() {
                    SessionService.login($scope.user.name);
                    $state.go('stream');
                })
                .error(function(data) {
                    switch(data.status) {
                        case "USER_LOGIN_FAILED":
                            $scope.displayMessage(data.description, data.status, "Error");
                            break;
                        default:
                            $scope.displayMessage("The app cannot communicate with the InformHer server due to connectivity problems. Please try again later.", "CONNECTIVITY_ERROR", "Error");
                            break;
                    }
                    console.log(data);
                });
        };
    })

    .controller('RegisterCtrl', function($scope, $ionicModal, $http) {

        /* -------- *
         *  FIELDS  *
         * -------- */

        /*
        $scope.username = 'ichi-san';
        $scope.email = 'ichi-san@example.com';
        $scope.password = 'one_one_one';
        $scope.passwordAgain = 'one_one_one';
        $scope.agree = false;
        */

        /* --------- *
         *  METHODS  *
         * --------- */

        $scope.submit = function() {
            $http.post('http://informherapi.azurewebsites.net/user', {
                    'username': $scope.username,
                    'email': $scope.email,
                    'password': $scope.password,
                    'password_confirmation': $scope.passwordAgain
                }
            )
        };

        /* -------- *
         *  MODALS  *
         * -------- */

        $ionicModal.fromTemplateUrl('eula.html', function(modal) {
            $scope.modal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        $scope.openModal = function() {
            $scope.modal.show();
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };
    })

    .controller('ProfileCtrl', function($scope, $state, $stateParams, SessionService) {
        $scope.user = SessionService.user;

        $scope.backBtnText = 'Back';
        $scope.backBtnHref = '#/stream';
        $scope.primaryBtnText = 'Edit';

        $scope.editMode = false;

        $scope.repaint = function() {
            $scope.backBtnText = $scope.editMode ? 'Cancel' : 'Back';
            $scope.backBtnHref = $scope.editMode ? '#/profile/view/' + $scope.user.id : '#/stream';
            $scope.primaryBtnText = $scope.editMode ? 'Save' : 'Edit';
            $scope.disabledClass = $scope.editMode ? '' : ' disabled';
        };

        $scope.save = function() {

        };

        $scope.reset = function() {

        };

        $scope.primaryBtnClick = function() {
            if($scope.editMode) {
                $scope.save();
                $scope.editMode = false;
            }
            else
                $scope.editMode = true;
            $scope.repaint();
        };

        $scope.backBtnClick = function() {
            if($scope.editMode) {
                $scope.reset();
                $scope.editMode = false;
                $scope.repaint();
                $state.go('profile');
            }
            else
                $state.go('stream');
        };
    })

// A simple controller that fetches a list of data from a service
    .controller('StreamCtrl', function ($scope, $stateParams, $state, $ionicModal, PostService, TagService, $http) {
        var contentEl = document.getElementById('menu-center');
        var content = new ionic.views.SideMenuContent({
            el: contentEl,
	        onDrag: function(e) {
		        console.log('a');
	        }
        });

        var leftMenuEl = document.getElementById('menu-left');
        var leftMenu = new ionic.views.SideMenu({
            el: leftMenuEl,
            width: 270
        });

        $scope.sideMenuController = new ionic.controllers.SideMenuController({
            content: content,
            left: leftMenu,
        });

		$scope.leftButtons = [
			{
				type: 'button-clear',
				content: '<i class="icon ion-navicon"></i>',
				tap: function(e) {
					$scope.toggleLeft();
				}
			},
			{
				type: 'button-clear',
				content: '<i class="icon ion-search"></i>',
				tap: function(e) {
					alert('search');
				}
			}
		];

		$scope.rightButtons = [
			{
				type: 'button-clear',
				content: '<i class="icon ion-gear-a"></i>',
				tap: function(e) {
					$state.go('settings.main');
				}
			}
		];

        // "Pets" is a service returning mock data (services.js)
        $scope.posts = [];// = PostService.all();

        // TODO posts
        // TODO comments
        // TODO likes
        // TODO settings pages: account and stream
        // TODO saving and resetting profile edits
        $scope.postType = 'ask';

        $scope.title = 'hello'; // not for shoutout
        $scope.tags = ['tag1', 'tag2', 'tag3'];
        $scope.content = 'Question'; // not for shoutout

        $scope.trackLocation = false; // for shoutout only
        $scope.contact = false; // for shoutout only
        $scope.immediateContact = false; // for shoutout only

        $scope.criteria = { ask: true, relate: true, shoutout: true };
        $scope.sortAscending = { title: true, author: true, date: true };
        $scope.currentSort = 'date';

        $scope.askClass = 'active';
        $scope.relateClass = 'active';
        $scope.shoutoutClass = 'active';

        $scope.sortTitleClass = '';
        $scope.sortAuthorClass = '';
        $scope.sortDateClass = 'ion-arrow-down-c active';

        $scope.onRefresh = function() {
            console.log('Refresh complete!');
            $scope.posts = PostService.all();
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.colorForTag = function(tag) {
            return TagService.colorForTag(tag);
        };

        $scope.filter = function() {
            $scope.posts = PostService.filter($scope.criteria);
        };

        $scope.get = function(id) {
            PostService.get(id);
        };

        $scope.submit = function() {

        };

        $scope.toggleFilter = function(category) {
            $scope.criteria[category] = !$scope.criteria[category];
            $scope.askClass = $scope.criteria.ask ? 'active' : '';
            $scope.relateClass = $scope.criteria.relate ? 'active' : '';
            $scope.shoutoutClass = $scope.criteria.shoutout ? 'active' : '';
        };

        $scope.doSort = function(sort) {
            if(sort != $scope.currentSort)
                $scope.sortAscending = { title: true, author: true, date: true };
            $scope.currentSort = sort;
            $scope.sortAscending[sort] = !$scope.sortAscending[sort];

            $scope.sortTitleClass = $scope.currentSort != 'title' ? '' : 'active ' + ($scope.sortAscending.title ? 'ion-arrow-up-c' : 'ion-arrow-down-c');
            $scope.sortAuthorClass = $scope.currentSort != 'author' ? '' : 'active ' + ($scope.sortAscending.author ? 'ion-arrow-up-c' : 'ion-arrow-down-c');
            $scope.sortDateClass = $scope.currentSort != 'date' ? '' : 'active ' + ($scope.sortAscending.date ? 'ion-arrow-up-c' : 'ion-arrow-down-c');
        };

        $scope.logout = function() {
            $http.get('http://informherapi.azurewebsites.net/user/logout')
                .success(function() {
                    SessionService.logout();
                    $state.go('home');
                })

        };

        /* -------- *
         *  MODALS  *
         * -------- */

        $scope.modalUrls = ['ask.html', 'relate.html', 'shoutout.html', 'language.html'];
        $scope.currentModal = '';
        $scope.modals = [];

        _.each($scope.modalUrls, function(templateUrl) {
            $ionicModal.fromTemplateUrl(templateUrl, function(modal) { $scope.modals[templateUrl] = modal; },
                {
                    scope: $scope,
                    animation: 'slide-in-up'
                });
        });

        $scope.openModal = function(name) {
            $scope.currentModal = name;
            $scope.modals[name].show();
        };

        $scope.closeModal = function() {
            $scope.modals[$scope.currentModal].hide();
            $scope.currentModal = '';
        };

        $scope.toggleLeft = function() {
            try {
                $scope.sideMenuController.toggleLeft();
            } catch(e) {
                // TODO fix error triggered by toggleLeft
            }
        };

        $scope.toggleRight = function() {
            try {
                $scope.sideMenuController.toggleRight();
            } catch(e) {
                // TODO fix error triggered by toggleLeft
            }
        };

        /* ---------------- *
         *  DEFAULT METHOD  *
         * ---------------- */

        $scope.filter($scope.criteria);
    })

// A simple controller that shows a tapped item's data
    .controller('PostCtrl', function ($scope, $stateParams, PostService) {
        // "Pets" is a service returning mock data (services.js)
        $scope.post = PostService.get($stateParams.postId);

        $scope.formatDate = function(date) {
            return new Date(date).toString();
        };

        $scope.goBack = function() {

        };
    });
