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
      return Transactions.find();
  },
  hasMoreFillings: function () {
      let numFillings = Transactions.find().count()
      return numFillings >= Template.instance().limit.get();
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
