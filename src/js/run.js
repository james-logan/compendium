angular
  .module('compendiumPrime')
  .run(function(Auth, $rootScope, STORAGE_URL) {
    $rootScope.$on('$routeChangeStart', function (event, nextRoute) {
      var fb = new Firebase(STORAGE_URL)

      $rootScope.auth = fb.getAuth();

      if (nextRoute.$$route && nextRoute.$$route.private) {
        Auth.requireLogin();
      }
    })
  })
