/*****************************************************************************/
/* FillingDetail: Event Handlers */
/*****************************************************************************/
Template.FillingDetail.events({
});

/*****************************************************************************/
/* FillingDetail: Helpers */
/*****************************************************************************/
Template.FillingDetail.helpers({
  getFillingData: () => {
    let fillingId = Router.current().params._id
    if(fillingId)
      return Transactions.findOne(fillingId)
  },
  getCssClassNameForStatus: function(status) {
    if (status === 'pending') {
      return 'label-warning'
    } else if(status === 'rejected') {
      return 'label-danger'
    } else if(status === 'approved') {
      return 'label-success'
    } else {
      return ''
    }
  },
  getCssClassNameForRemittanceProgress: function(status) {
    if (status === 'settled') {
      return 'label-success'
    } else {
      return 'label-danger'
    }
  },
  getCssClassNameForClaimStatus: function(status) {
    if (status === 'opened') {
      return 'label-success'
    } else {
      return 'label-danger'
    }
  },
});

/*****************************************************************************/
/* FillingDetail: Lifecycle Hooks */
/*****************************************************************************/
Template.FillingDetail.onCreated(function () {
  let self = this
  let fillingId = Router.current().params._id

  self.autorun(() => {
    Meteor.subscribe('Transaction', fillingId);
  })
});

Template.FillingDetail.onRendered(function () {
    $("html, body").animate({ scrollTop: 0 }, "slow");
});

Template.FillingDetail.onDestroyed(function () {
});
