import _ from 'underscore'
import moment from 'moment'

/*****************************************************************************/
/* Home: Event Handlers */
/*****************************************************************************/
Template.Home.events({
});

/*****************************************************************************/
/* Home: Helpers */
/*****************************************************************************/
Template.Home.helpers({
  'fillingsData': () => {
    let fillings = Transactions.find().fetch();
    
    let groupedResults = _.groupBy(fillings, (result) => moment(result['fileDate']).month());

    let groupedResultsAsArray = []
    let allKeys = Object.keys(groupedResults)

    allKeys.forEach(function(keyName) {
        groupedResultsAsArray.push(groupedResults[keyName]);
    });

    return groupedResultsAsArray
    },
    hasMoreFillings: function () {
        let numFillings = Transactions.find().count()
        return numFillings >= Template.instance().limit.get();
    },
    getMonthAndYearOfMonthFillings: function(monthFillings) {
        let firstFilling = monthFillings[0]

        let monthFullName = moment(firstFilling.fileDate).format('MMMM');
        let year = moment(firstFilling.fileDate).format('YYYY');

        return {monthFullName, year}
    },
    getCssClassNameForStatus: function(status) {
        if (status === 'pending') {
            return 'text-warning'
        } else if(status === 'rejected') {
            return 'text-danger'
        } else if(status === 'approved') {
            return 'text-success'
        }
    },
    eq: function(a, b) {
        return a === b
    }
});

/*****************************************************************************/
/* Home: Lifecycle Hooks */
/*****************************************************************************/
Template.Home.onCreated(function () {
  let self = this;
  let limit = 20;
  
  self.loaded = new ReactiveVar(0);
  self.limit = new ReactiveVar(getLimit());

  self.isFetchingData = new ReactiveVar()
  self.isFetchingData.set(true)

  self.autorun(function () {
      let limit = self.limit.get();
      
      let subscription = self.subscribe('Transactions', limit);
      if (subscription.ready()) {
          self.loaded.set(limit);
          self.isFetchingData.set(false)
      }
  });

  Meteor.call('transactions/totalAggregateSummary', 'year', function(err, res) {
    //   console.log(`res: `, res)

  })
});

Template.Home.onRendered(function () {
  this.scrollHandler = function(e) {
      let threshold, target = $("#showMoreResults");
      if (!target.length) return;

      threshold = $(window).scrollTop() + $(window).height() - target.height();

      if (target.offset().top < threshold) {
          if (!target.data("visible")) {
              target.data("visible", true);
              var limit = this.limit.get();
              limit += 20;
              this.limit.set(limit);
          }
      } else {
          if (target.data("visible")) {
              target.data("visible", false);
          }
      }
  }.bind(this);

  $(window).on('scroll', this.scrollHandler);
});

Template.Home.onDestroyed(function () {
    $(window).off('scroll', this.scrollHandler);
});

function getLimit() {
    return 20;
}
