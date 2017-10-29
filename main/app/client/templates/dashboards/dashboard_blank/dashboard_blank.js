/*****************************************************************************/
/* DashboardBlank: Event Handlers */
/*****************************************************************************/
Template.DashboardBlank.events({
    'click .addexemptlist'(e, tmpl) {
        Router.go('filling.create')
    }
});

/*****************************************************************************/
/* DashboardBlank: Helpers */
/*****************************************************************************/
Template.DashboardBlank.helpers({
});

/*****************************************************************************/
/* DashboardBlank: Lifecycle Hooks */
/*****************************************************************************/
Template.DashboardBlank.onCreated(function () {
});

Template.DashboardBlank.onRendered(function () {
});

Template.DashboardBlank.onDestroyed(function () {
});
