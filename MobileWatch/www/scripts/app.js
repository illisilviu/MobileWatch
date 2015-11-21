angular.module('MobileWatch', ['ionic'])
    /**
     * The Districts factory handles saving and loading districts
     * from local storage, and also lets us save and load the
     * last active district index.
     */
    .factory('Districts', function () {
        return {
            all: function () {
                var districtString = window.localStorage['districts'];
                if (districtString) {
                    return angular.fromJson(districtString);
                }
                return [];
            },
            save: function (districts) {
                window.localStorage['districts'] = angular.toJson(districts);
            },
            newDistrict: function (districtTitle) {
                // Add a new district
                return {
                    title: districtTitle,
                    events: []
                };
            },
            getLastActiveIndex: function () {
                return parseInt(window.localStorage['lastActiveDistrict']) || 0;
            },
            setLastActiveIndex: function (index) {
                window.localStorage['lastActiveDistrict'] = index;
            }
        }
    })
    .controller('MobileWatchCtrl', function ($scope, $timeout, $ionicModal, Districts, $ionicSideMenuDelegate) {
        // A utility function for creating a new district
        // with the given districtTitle
        var createDistrict = function (districtTitle) {
            var newDistrict = Districts.newDistrict(districtTitle);
            $scope.districts.push(newDistrict);
            Districts.save($scope.districts);
            $scope.selectDistrict(newDistrict, $scope.districts.length - 1);
        }


        // Load or initialize districts
        $scope.districts = Districts.all();

        // Grab the last active, or the first district
        $scope.activeDistrict = $scope.districts[Districts.getLastActiveIndex()];

        // Called to create a new district
        $scope.newDistrict = function () {
            var districtTitle = prompt('District name');
            if (districtTitle) {
                createDistrict(districtTitle);
            }
        };

        // Called to select the given district
        $scope.selectDistrict = function (district, index) {
            $scope.activeDistrict = district;
            Districts.setLastActiveIndex(index);
            $ionicSideMenuDelegate.toggleLeft(false);
        };

        // Create and load the Modal
        $ionicModal.fromTemplateUrl('new-event.html', function (modal) {
            $scope.eventModal = modal;
        }, {
            scope: $scope
        });

        // Called when the form is submitted
        $scope.createEvent = function (event) {
            if (!$scope.activeDistrict || !event) {
                return;
            }
            $scope.activeDistrict.events.push({
                title: event.title
            });
            $scope.eventModal.hide();

            // Inefficient, but save all the districts
            Districts.save($scope.districts);

            event.title = '';
        };

        // Open our new event modal
        $scope.newEvent = function () {
            $scope.eventModal.show();
        };

        // Close the new event modal
        $scope.closeNewEvent = function () {
            $scope.eventModal.hide();
        };

        $scope.toggleDistricts = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        // Try to create the first district, make sure to defer
        // this by using $timeout so everything is initialized
        // properly
        $timeout(function () {
            if ($scope.districts.length == 0) {
                while (true) {
                    var districtTitle = prompt('Your first district title:');
                    if (districtTitle) {
                        createDistrict(districtTitle);
                        break;
                    }
                }
            }
        });
    });
