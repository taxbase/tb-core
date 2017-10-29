/*****************************************************************************/
/* MasterLayout: Event Handlers */
/*****************************************************************************/
Template.ApplicationLayout.events({
	'click .logout': function(e, tmpl) {
        e.preventDefault()
        Router.go('home');
    	Meteor.logout(function(err) {
            if (!err) {
                Session.keys = {};
            }
        });
    },

    'click .button-menu-mobile'(e, tmpl) {
        $('.page-title-box').toggleClass('menu-fix');
        $('.footer').toggleClass("menu-fix");
    },

    'click .button-menu-mobile'(e, tmpl) {
        $('.page-title-box').toggleClass('menu-fix');
        $('.footer').toggleClass("menu-fix");
    }

});

/*****************************************************************************/
/* ApplicationLayout: Helpers */
/*****************************************************************************/
Template.ApplicationLayout.helpers({
	activeIfRouteIsIn: function (route) {
        return Router.current().route.getName() === route ? 'active' : '';
    },
    activeIfRouteIs: function (route) {
        if (route === 'exempts') {
            if (Router.current().route.getName() === 'zero-rated-products.list' ||
            Router.current().route.getName() === 'none-zero-rated-products.list')
                return  'active'
        }

        if (route === 'adjustments') {
            if (Router.current().route.getName() === 'adjustments.sales')
                return  'active'
        }
        return ''
    },
    displayIfRoute: function (route) {
        if (route === 'exempts') {
            if (Router.current().route.getName() === 'zero-rated-products.list' ||
            Router.current().route.getName() === 'none-zero-rated-products.list')
                return 'display:block;';
        }

        if (route === 'adjustments') {
            if (Router.current().route.getName() === 'adjustments.sales')
                return 'display:block;';
        }
        return 'display:none;'
    },
    timeToConnect: function() {
        return Template.instance().nextRetry.get()
    },
    show: function () {
        //only show alert after the first connection attempt, if disconnected, if not manually disconnected (status == 'offline), if at least second retry
        if(!Template.instance().firstConnection.get() && !Meteor.status().connected && Meteor.status().status !== 'offline' && Meteor.status().retryCount > 1){
            return true;
        }
        return false;
    },
    currentUserId: function(){
        return Meteor.userId();
    },
    loggedIn: function() {
        return !!Meteor.userId();
    }
});

/*****************************************************************************/
/* MasterLayout: Lifecycle Hooks */
/*****************************************************************************/
Template.ApplicationLayout.onCreated(function () {
    this.state = new ReactiveDict();
    this.state.set('show-sub-menu', false);

    let instance = this;

    instance.updateCountdownTimeout;
    instance.nextRetry = new ReactiveVar(0);
    instance.options = {
        style: true,
        lang: 'en',
        position: 'bottom',
        showLink: true,
        msgText: '',
        linkText: '',
        overlay: false
    };
    instance.firstConnection = new ReactiveVar(true);
    
    //get template params
    if(Template.currentData()) {
        for(var property in instance.options) {
            if(Template.currentData()[property] !== undefined) {
                instance.options[property] = Template.currentData()[property];
            }
        }
    }

    //set tracker for retry delay
    Tracker.autorun(function() {
        //set nextRetry delay update
        if(Meteor.status().status === 'waiting') {
            instance.updateCountdownTimeout = Meteor.setInterval(function() {
                instance.nextRetry.set(Math.round((Meteor.status().retryTime - (new Date()).getTime()) / 1000));
            }, 1000);
        } else {
            instance.nextRetry.set(0);
            Meteor.clearInterval(instance.updateCountdownTimeout);
        }
    });

    //do not alert on first connection to avoid meteor status flashing
    Tracker.autorun(function(computation) {
        if(Meteor.status().connected && Meteor.status().status === 'connected') {
            instance.firstConnection.set(false);
            computation.stop();
        }
    });
});

Template.ApplicationLayout.onRendered(function () {
    $(".button-menu-mobile").click(function() {
        $('#wrapper').toggleClass('enlarged forced');

      })

      $('.has_sub a').click(function() {
        $(this).toggleClass('subdrop');
        $(this).next().toggleClass('menu-show');
        
        let isLarge = $("#wrapper").hasClass("enlarged");
        if(isLarge){
            $('.has_sub a').removeClass('menu-show');
        }

      })

      $('#sidebar-menu ul li').hover(function(){
        let targetMenu = $(this);


      })

     

      function initscrolls() {
        jQuery.browser.mobile !== !0 && ($(".slimscroller").slimscroll({
          height: "auto",
          size: "5px"
        }), $(".slimscrollleft").slimScroll({
          height: "auto",
          position: "right",
          size: "5px",
          color: "#dcdcdc",
          wheelStep: 5
        }))
      }

      initscrolls();
    
});

Template.ApplicationLayout.onDestroyed(function () {
});


