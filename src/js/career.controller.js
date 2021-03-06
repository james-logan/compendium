angular
  .module('compendiumPrime')
  .controller('careerController', function ($location, $rootScope, $http, STORAGE_URL, $scope) {
    var vm = this;

    // $('.chosen-select').chosen()
    // $('.chosen-select-2').chosen({max_selected_options: 2})

    vm.info = {};
    vm.points;
    vm.tagForm = false;
    vm.timeLineHeight;

    //grabs your profile data from firebase
    $http
      .get(STORAGE_URL + '/profiles/' + $rootScope.auth.uid + '.json')
      .success(function (data) {
        vm.info = data;
        // vm.timeLineHeight = vm.lineHeight(data.finished)
        timeLineBuilder(vm.info.finished)
      })

    //grabs your points from firebase
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
        $http
          .put(STORAGE_URL + 'profiles/' + $rootScope.auth.uid + '/currentlyreading/' + book.title.toLowerCase() + '.json', book)
          .success(function () {
          })
      }
    }

    //THIS IS CODE FOR THE OLD HOME-MADE TIMELINE CREATION, REPLACED BY TIMELINE JS BELOW

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

    //Takes the data and pushes it onto an object (vm.dataObject.timeline.date) which
    //timelineJS will use to build the timeline widget. And then creates the timeline.

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
        vm.dataObject.timeline.date.push(point)

      })
      //TimelineJS function which actually builds the timeline widget:
      createStoryJS({
        type:       'timeline',
        width:      '650',
        height:     '550',
        source:     vm.dataObject,
        embed_id:   'timeline-embed',
        start_at_end: true
      });

    }


    //Object that timelineJS uses to store the data for the timeline
    vm.dataObject = {
      "timeline":
      {
        "type":"default",
        "date": [
        ]
      }
    }


  })
