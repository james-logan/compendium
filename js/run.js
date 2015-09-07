'use strict';

angular.module('compendiumPrime').run(function (Auth, $rootScope, STORAGE_URL) {
  $rootScope.$on('$routeChangeStart', function (event, nextRoute) {
    var fb = new Firebase(STORAGE_URL);

    $rootScope.auth = fb.getAuth();

    if (nextRoute.$$route && nextRoute.$$route['private']) {
      Auth.requireLogin();
    }
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9qcy9ydW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLENBQ0osTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQ3pCLEdBQUcsQ0FBQyxVQUFTLElBQUksRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFO0FBQzNDLFlBQVUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsVUFBVSxLQUFLLEVBQUUsU0FBUyxFQUFFO0FBQzlELFFBQUksRUFBRSxHQUFHLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFBOztBQUVsQyxjQUFVLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFL0IsUUFBSSxTQUFTLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLFdBQVEsRUFBRTtBQUNsRCxVQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7S0FDckI7R0FDRixDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoic3JjL2pzL3J1bi5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXJcbiAgLm1vZHVsZSgnY29tcGVuZGl1bVByaW1lJylcbiAgLnJ1bihmdW5jdGlvbihBdXRoLCAkcm9vdFNjb3BlLCBTVE9SQUdFX1VSTCkge1xuICAgICRyb290U2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgbmV4dFJvdXRlKSB7XG4gICAgICB2YXIgZmIgPSBuZXcgRmlyZWJhc2UoU1RPUkFHRV9VUkwpXG5cbiAgICAgICRyb290U2NvcGUuYXV0aCA9IGZiLmdldEF1dGgoKTtcblxuICAgICAgaWYgKG5leHRSb3V0ZS4kJHJvdXRlICYmIG5leHRSb3V0ZS4kJHJvdXRlLnByaXZhdGUpIHtcbiAgICAgICAgQXV0aC5yZXF1aXJlTG9naW4oKTtcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuIl19