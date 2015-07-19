angular
  .module('compendiumPrime')
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
