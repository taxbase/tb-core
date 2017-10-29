/*****************************************************************************/
/* Login: Event Handlers */
/*****************************************************************************/
Template.Login.events({
    "click .sign-btn"(e, tmpl) {
        
    },

    'submit form':function(e, tmpl) {
        e.preventDefault();

        let singinBtn = $(e.currentTarget);
        let spinner = $('.blah');
        singinBtn.attr('disabled', 'disabled');
        spinner.css('display', 'block');

        var email = tmpl.find('[type="email"]').value;
        var password = tmpl.find('[type="password"]').value;

        Meteor.loginWithPassword(email, password, function(err){
            if (err) {
                console.log(err);
                tmpl.$('div.signin_email').addClass('has-error');
                tmpl.$('span.help-block').html('Your email or password is incorrect');
                spinner.css('display', 'none');
                singinBtn.attr('disabled', '');
            }
        });
    },
});

/*****************************************************************************/
/* Login: Helpers */
/*****************************************************************************/
Template.Login.helpers({
});

/*****************************************************************************/
/* Login: Lifecycle Hooks */
/*****************************************************************************/
Template.Login.onCreated(function () {
});

Template.Login.onRendered(function () {
    var typed = new Typed(".write", {
        // Waits 1000ms after typing "First"
        strings: ["Efficient.", "Smarter."],
        startDelay: 600,
        smartBackspace: true,
        typeSpeed: 100,
        backSpeed: 100,
        showCursor: false
    });

    typed
});

Template.Login.onDestroyed(function () {
});
