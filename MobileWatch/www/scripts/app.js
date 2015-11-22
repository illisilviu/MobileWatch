angular.module('MobileWatch', ['ionic', 'ngCordova'])
    .factory('Data', function () {
        return {
            ActiveMap: null,
            ActiveMarker: null
        };
    })
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('map', {
                url: '/',
                templateUrl: 'templates/map.html',
                controller: 'MapCtrl'
            });

        $urlRouterProvider.otherwise('/');
    })
    .controller('MobileWatchCtrl', function ($scope, $ionicModal, Data) {
        $scope.Data = Data;
        $scope.Categories = [
            { title: 'burglary', color: '886aea' },
            { title: 'harassment', color: '33cd5f' },
            { title: 'pickpocketing', color: 'ffc900' },
            { title: 'vandalism', color: '387ef5' },
            { title: 'violence', color: 'ef473a' },
        ];

        $scope.Events = [];

        $ionicModal.fromTemplateUrl('templates/new-event.html', function (modal) {
            $scope.eventModal = modal;
        }, {
            scope: $scope
        });

        // Open our new event modal
        $scope.newEvent = function () {
            $scope.eventModal.show();
        };

        // Close the new event modal
        $scope.closeNewEvent = function () {
            $scope.eventModal.hide();
        };

        $scope.createEvent = function (event) {
            if (!event) {
                return;
            }
          
            $scope.Events.push({
                title: event.category.title,
                description: event.description,
                position: $scope.Data.ActiveMarker.getPosition()
            });

            $scope.eventModal.hide();

            event.description = '';

            var pinColor = event.category.color;
            var pinImage = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|' + pinColor,
                new google.maps.Size(21, 34),
                new google.maps.Point(0, 0),
                new google.maps.Point(10, 34));

            var pinShadow = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_shadow',
                new google.maps.Size(40, 37),
                new google.maps.Point(0, 0),
                new google.maps.Point(12, 35));

            var marker = new google.maps.Marker({
                map: $scope.Data.ActiveMap,
                draggable: false,
                animation: google.maps.Animation.DROP,
                position: $scope.Events[$scope.Events.length - 1].position,
                icon: pinImage,
                shadow: pinShadow
            });

            var infoWindow = new google.maps.InfoWindow({
                content: $scope.Events[$scope.Events.length - 1].title + ': ' + $scope.Events[$scope.Events.length - 1].description
            });

            google.maps.event.addListener(marker, 'click', function () {
                infoWindow.open($scope.Data.ActiveMap, marker);
            });
        };
    })
    .controller('MapCtrl', function ($scope, $state, $cordovaGeolocation, Data) {
        $scope.Data = Data;

        var options = {
            timeout: 10000,
            enableHighAccuracy: true
        };

        //$cordovaGeolocation.getCurrentPosition(options)
        //    .then(function (position) {
                var latitude = '44.4261468';
                var longitude = '26.1101559';

                //var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                var latLng = new google.maps.LatLng(latitude, longitude);

                var mapOptions = {
                    center: latLng,
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                $scope.Data.ActiveMap = new google.maps.Map(document.getElementById('map'), mapOptions);

                // wait until the map is loaded
                google.maps.event.addListenerOnce($scope.Data.ActiveMap, 'idle', function () {
                    $scope.Data.ActiveMarker = new google.maps.Marker({
                        map: $scope.Data.ActiveMap,
                        draggable:true,
                        animation: google.maps.Animation.DROP,
                        position: latLng
                    });

                    var infoWindow = new google.maps.InfoWindow({
                        content: 'you are here!'
                    });

                    google.maps.event.addListener($scope.Data.ActiveMarker, 'click', function () {
                        infoWindow.open($scope.Data.ActiveMap, $scope.Data.ActiveMarker);
                    });
                });
            //}, function (error) {
            //    console.log('could not get location');
            //})
    });