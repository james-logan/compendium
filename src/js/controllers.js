angular
  .module('compendiumPrime')
  .controller('logOutController', function (Auth, $scope, $location) {
    Auth.logout(function () {
      $location.path('/')
      $scope.$apply();
    })
  })
  .controller('launchController', function ($location, $http, $scope, $rootScope, Auth, STORAGE_URL) {
    var vm = this;
    vm.data = {};

    vm.login = function () {
      Auth.login(vm.data, function () {
        $location.path('/profilepage')
        $scope.$apply();
      })
    }

    var pointStarter = function () {
      $http
        .put(STORAGE_URL + 'points/' + $rootScope.auth.uid + '.json', 0)
    }

    vm.register = function () {
      Auth.register(vm.data, function (data) {
        Auth.login(vm.data);
        pointStarter();
        $location.path('/profileform')
        $scope.$apply();
      })
    }
  })
  .controller('leaderBoardController', function ($location, $http, STORAGE_URL) {
    var vm = this;
    vm.summary = {}
    $http
      .get(STORAGE_URL + 'points.json')
      .success(function (data) {
        Object.keys(data).forEach(function (uid) {
          vm.summary[uid] = {
            points: data[uid]
          }
          $http
            .get(STORAGE_URL + 'profiles/' + uid + '.json')
            .success(function (data) {
              vm.summary[uid].username = data.username;
              vm.summary[uid].img = data.img;
            })
        })

      })
  })

  .controller('profileFormController', function ($http, $rootScope, STORAGE_URL, $location) {
    var vm = this;

    vm.data = {};
    vm.modal = false;

    $http
      .get(STORAGE_URL + 'profiles/' + $rootScope.auth.uid + '.json')
      .success(function (data) {
        vm.data = data;
      })

    vm.save = function () {
      $http
        .put(STORAGE_URL + 'profiles/' + $rootScope.auth.uid + '.json', vm.data)
        .success(function (data) {
          vm.modal=true;
        })
    }

    vm.backToProfile = function () {
      $location.path('/profilepage')
    }

    vm.closeModal = function () {
      vm.modal = false;
    }
  })

  .controller( 'bookPageController', function ($http, $routeParams, STORAGE_URL) {
    var vm = this;
    vm.id = $routeParams.id
    vm.bookData = {}
    $http
        .get('https://www.googleapis.com/books/v1/volumes?q=' + vm.id + '&langRestrict=english&maxResults=1&orderBy=relevance&printType=books&projection=lite&key= AIzaSyChXEjLh0EhY7pzGcddLTnlcku596jLl0Y')
        .success(function (data) {
          vm.bookData.title = data.items[0].volumeInfo.title;
          vm.bookData.author = data.items[0].volumeInfo.authors[0]
          vm.bookData.img = data.items[0].volumeInfo.imageLinks.thumbnail
        })

    $http
      .get(STORAGE_URL + 'books/' + vm.id.toLowerCase() + '.json')
      .success(function (data) {
        vm.tagSorter(data);
      })
    vm.finalObj = {
        space: {},
        subgen: {},
        social: {},
        scientific: {},
        other: {}
      }
    vm.tagSorter = function (obj) {
      var refArr = ["space", "subgen", "social", "scientific", "other"]
      Object.keys(obj).forEach(function (uid) {
        refArr.forEach(function (cat) {
          var tag = obj[uid][cat]
            if (vm.finalObj[cat][tag]) {
              vm.finalObj[cat][tag] +=1;
            } else {
              vm.finalObj[cat][tag] = 1;
            }
        })
      })
    }

  })
