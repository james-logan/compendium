angular
  .module('compendiumPrime')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/launch.html',
        controller: 'launchController',
        controllerAs: 'launch'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'launchController',
        controllerAs: 'launch'
      })
      .when('/profilepage', {
        templateUrl: 'views/career.html',
        controller: 'careerController',
        controllerAs: 'career',
        private: true
      })
      .when('/profileform', {
        templateUrl: 'views/profileform.html',
        controller: 'profileFormController',
        controllerAs: 'profform'
      })
      .when('/leaderboards', {
        templateUrl: 'views/leaderboards.html',
        controller: 'leaderBoardController',
        controllerAs: 'lead',
        private: true
      })
      .when('/search', {
        templateUrl: 'views/search.html'
      })
      .when('/trials', {
        templateUrl: 'views/trials.html'
      })
      .when('/logout', {
        templateUrl: 'views/logout.html',
        controller: 'logOutController',
        private: true
      })
      .when('/book/:id', {
        templateUrl: 'views/book.html',
        controller: 'bookPageController',
        controllerAs: 'bpage'
      })
  })
