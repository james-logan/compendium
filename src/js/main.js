angular
  .module('compendiumPrime', ['ngRoute', 'localytics.directives'])
  .constant('STORAGE_URL', 'https://scificompendium.firebaseio.com/')
  .run(function(Auth, $rootScope, STORAGE_URL) {
    $rootScope.$on('$routeChangeStart', function (event, nextRoute) {
      var fb = new Firebase(STORAGE_URL)

      $rootScope.auth = fb.getAuth();

      if (nextRoute.$$route && nextRoute.$$route.private) {
        Auth.requireLogin();
      }
    })
  })
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
  .controller('leaderBoardController', function ($location, $http, STORAGE_URL) {
    var vm = this;
    vm.summary = {}
    $http
      .get(STORAGE_URL + 'points.json')
      .success(function (data) {
        Object.keys(data).forEach(function (uid) {
          console.log(data)
          console.log(data[uid].points)
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
    console.log(vm.id)
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
      console.log(obj)
      var refArr = ["space", "subgen", "social", "scientific", "other"]
      Object.keys(obj).forEach(function (uid) {
        console.log("obj.uid", obj[uid])
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
  .controller('careerController', function ($location, $rootScope, $http, STORAGE_URL, $scope) {
    var vm = this;

    // $('.chosen-select').chosen()
    // $('.chosen-select-2').chosen({max_selected_options: 2})

    vm.info = {};
    vm.points;
    vm.tagForm = false;
    vm.timeLineHeight;

    //grabs your profile data
    $http
      .get(STORAGE_URL + '/profiles/' + $rootScope.auth.uid + '.json')
      .success(function (data) {
        vm.info = data;
        // vm.timeLineHeight = vm.lineHeight(data.finished)
        timeLineBuilder(vm.info.finished)
      })

    //grabs your points
    $http
      .get(STORAGE_URL + '/points/' + $rootScope.auth.uid + '.json')
      .success(function (data) {
        vm.points = data;
        ranker();
      })


    var ranker = function () {
      //grabs your points and determines your rank based on them
      vm.rank = (vm.points < 10) ? "Initiate":
          (vm.points<50) ? "Novenciate":
          (vm.points<150) ? "Curator":
          (vm.points<500) ? "Senticar":
          (vm.points<1000) ? "Cryptonomer":
          (vm.points<5000) ? "Hierophantic": "Prime";
    }

    vm.edit = function () {
      //takes you to the profile edit form
      $location.path('/profileform')
    }

    vm.finishedBook = function () {

      $http
        .get('https://www.googleapis.com/books/v1/volumes?q=' + vm.newBook.title + '&langRestrict=english&maxResults=1&orderBy=relevance&printType=books&projection=lite&key= AIzaSyChXEjLh0EhY7pzGcddLTnlcku596jLl0Y')
        .success(function (data) {
          vm.newBook.author = data.items[0].volumeInfo.authors[0]

          vm.newBook.img = data.items[0].volumeInfo.imageLinks.smallThumbnail

          // vm.newBook.img = data.items[0].volumeInfo.imageLinks.smallThumbnail
          putRequest();
        })

      vm.newBook.title = vm.newBook.title.split(" ").map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }).join(" ");

      vm.newBook = {
        title: vm.newBook.title,
        date: new Date()
      }

      var putRequest = function () {
        $http
          .put(STORAGE_URL + 'profiles/' + $rootScope.auth.uid + '/finished/' + vm.newBook.title.toLowerCase() + '.json', vm.newBook)
          .success(function (data) {
            vm.addPoints(5);
          })
      }

      vm.addPoints = function (pts, cb) {
        $http
          .get(STORAGE_URL + '/points/' + $rootScope.auth.uid + '.json')
          .success(function (data) {
            data += pts;
            $http
              .put(STORAGE_URL + '/points/' + $rootScope.auth.uid + '.json', data)
              .success(function () {
                if (cb) {
                  cb();
                }
              })
          })
      }

      vm.tagShower();
    }

    vm.tags = {
      space: "",
      subgen: "",
      social: "",
      scientific: "",
      other: ""
    }

    vm.tagPoster = function () {
      console.log(vm.tags)
      var tagPts = 0;
      Object.keys(vm.tags).forEach(function (cat) {
        if (vm.tags.cat != "") {
          tagPts += 2;
        }
      })
      $http
        .put(STORAGE_URL + 'profiles/' + $rootScope.auth.uid + '/finished/' + vm.newBook.title.toLowerCase() + '/tags.json', vm.tags)
        .success(function () {
          vm.addPoints(tagPts, vm.closeTagForm)
        })

      $http
        .put(STORAGE_URL + 'books/' + vm.newBook.title.toLowerCase() + '/' + $rootScope.auth.uid + '.json', vm.tags)
        .success(function () {})
    }

    vm.tagShower = function () {
      vm.tagForm = true;
    }

    vm.closeTagForm = function () {
      vm.tagForm = false;
      location.reload();
    }

    vm.newBook = {
      title: null,
      page: 0,
      total: 0
    }

    vm.newBookInProgress = function () {
      //adds a new book to your currently reading list

      vm.newBook.title = vm.newBook.title.split(" ").map(function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }).join(" ");

      $http
        .get('https://www.googleapis.com/books/v1/volumes?q=' + vm.newBook.title + '&langRestrict=english&maxResults=1&orderBy=relevance&printType=books&projection=lite&key= AIzaSyChXEjLh0EhY7pzGcddLTnlcku596jLl0Y')
        .success(function (data) {
          vm.newBook.author = data.items[0].volumeInfo.authors[0]

          vm.newBook.img = data.items[0].volumeInfo.imageLinks.smallThumbnail

          // vm.newBook.img = data.items[0].volumeInfo.imageLinks.smallThumbnail

          $http
            .put(STORAGE_URL + 'profiles/' + $rootScope.auth.uid + '/currentlyreading/' + vm.newBook.title.toLowerCase() + '.json', vm.newBook)
            .success(function () {
              location.reload();
            })
        })


    }

    vm.deleteProgressBook = function (title) {
      $http
        .delete(STORAGE_URL + 'profiles/' + $rootScope.auth.uid + '/currentlyreading/' + title.toLowerCase() + '.json')
        .success(function () {
          location.reload();

        })
    }

    vm.pageUpdate = function (img, page, total, title) {
      var book = {
        img: img,
        title: title,
        page: page,
        total: total
      }
      console.log(book)
      if (book.page === book.total) {
        $http
          .delete(STORAGE_URL + 'profiles/' + $rootScope.auth.uid + '/currentlyreading/' + book.title.toLowerCase() + '.json')
          .success(function () {
            vm.newBook = {
              title: book.title,
              date: new Date()
            }
            vm.finishedBook();
          })
      } else {
        console.log('cat')
        $http
          .put(STORAGE_URL + 'profiles/' + $rootScope.auth.uid + '/currentlyreading/' + book.title.toLowerCase() + '.json', book)
          .success(function () {
          })
      }
    }

    // vm.lineHeight = function (obj) {
    //   var timelineHeight = 0;
    //   var cat = Object.keys(obj).map(function (key) {
    //       return obj[key]
    //     }).sort(function (a, b) {
    //       var dateA = new Date(a.date)
    //       var dateB = new Date(b.date)
    //       return dateB.getTime() - dateA.getTime()
    //     })
    //   var topVal = 0;
    //   cat.forEach(function (book, i, array) {
    //     var recentDate = new Date(array[0].date)
    //     var bookDate = new Date(book.date)
    //     var potential = (20 * (recentDate.getTime() - bookDate.getTime()))/(1000 * 60 * 60 * 24)
    //     if (potential > topVal) {
    //       topVal = potential;
    //     }
    //     timelineHeight += book.topValue + 100;

    //   })
    //   return topVal + 100;
    // }

    function timeLineBuilder (data) {
      var point;
      Object.keys(data).forEach(function (key) {
        var date = new Date(data[key].date)
        var date = date.toLocaleDateString()
        point = {
            "startDate": date,
            "headline": "<a href='#/book/" + data[key].title.replace("'", "\'") + "'>" + data[key].title + "</a>",
            "text":"<p>" + data[key].author + "</p>",
            "classname":"optionaluniqueclassnamecanbeaddedhere",
            "asset": {
              "media": data[key].img + ".jpeg",
              "thumbnail": data[key].img
            }
        }
        console.log(data[key].title)
        vm.dataObject.timeline.date.push(point)

      })

      createStoryJS({
        type:       'timeline',
        width:      '650',
        height:     '550',
        source:     vm.dataObject,
        embed_id:   'timeline-embed',
        start_at_end: true
      });

    }

    vm.dataObject = {
      "timeline":
      {
        "type":"default",

        "date": [

        ]
      }
    }


  })

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
  .filter('percentage', function () {
    return function (obj) {
      if (obj) {
      Object.keys(obj).forEach(function (key) {
        obj[key].percentage = Math.round(obj[key].page * 100 / obj[key].total)
        if (isNaN(obj[key].percentage)) {
          obj[key].percentage = 0;
        }
      })
      return obj
      }
    }
  })
  .filter('timeLine', function ($rootScope) {
    return function (obj) {
      $rootScope.timelineHeight = 50;
      if (obj) {
        var cat = Object.keys(obj).map(function (key) {
          return obj[key]
        }).sort(function (a, b) {
          var dateA = new Date(a.date)
          var dateB = new Date(b.date)
          return dateB.getTime() - dateA.getTime()
        })
        cat.forEach(function (book, i, array) {
          var recentDate = new Date(array[0].date)
          var bookDate = new Date(book.date)
          book.topValue = (20 * (recentDate.getTime() - bookDate.getTime()))/(1000 * 60 * 60 * 24)
          if (i%2 === 1) {
            book.floatValue = "left";
            book.leftMargin = 0;
          } else {
            book.floatValue = "right";
            book.leftMargin = 310;
          }
        cat.forEach(function (book) {
          book.date = new Date(book.date)
          book.date = book.date.toLocaleDateString()
        })
        })
      return cat
      }
    }
  })
  .filter('objToArr', function () {
    return function (obj) {
      if (obj) {
        return Object
          .keys(obj)
          .map(function (key) {
            obj[key]._id = key;
            return obj[key];
          });
        }
      }
  })
  .filter('sortLeader', function () {
    return function (arr) {
      if (arr) {
        return arr.sort(function (a, b) {
          return b.points - a.points
        })
      }
    }
  })
