angular
  .module('compendiumPrime')
  .factory('Auth', function ($http, $rootScope, $location, STORAGE_URL) {
    var fb = new Firebase(STORAGE_URL);
    return {
      register: function (loginObj, cb) {
        fb.createUser(loginObj, function (err, authData) {
          if (err) {
            console.log(err)
          } else if (cb) {
            cb(authData);
          }
        })
      },
      login: function (loginObj, cb) {
        fb.authWithPassword(loginObj, function (err, authData) {
          if (err) {
            console.log('err')
          } else {
            $rootScope.auth = authData;
            if (cb) {
              cb();
            }
          }
        })
      },
      logout: function (cb) {
        fb.unauth(function () {
          $rootScope.auth = null;
          cb();
        });
      },
      requireLogin: function () {
        $rootScope.auth = fb.getAuth();
        if (!fb.getAuth()) {
          $location.path('/login');
        }
      }
    }
  })
