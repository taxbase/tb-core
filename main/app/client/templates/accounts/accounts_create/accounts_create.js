import moment from 'moment'

/*****************************************************************************/
/* AccountsCreate: Event Handlers */
/*****************************************************************************/
Template.AccountsCreate.events({
	'click #submitButton':function(e) {
		e.preventDefault()

    let firstName = $('[name="fname"]').val()
		let middleName = $('[name="mname"]').val()
		let lastName = $('[name="lname"]').val()

    let dateOfBirth = $('#datepicker-autoclose').val()
    let dateOfBirthAsDateObj = null
    if(dateOfBirth) {
      let dateOfBirthMoment = moment(dateOfBirth, 'MM/DD/yyyy')
      if(dateOfBirthMoment.isValid()) {
        dateOfBirthAsDateObj = dateOfBirthMoment.toDate()
      }
    }

    if(!firstName) {
      swal('Validation Error', 'Please enter the first name', 'error')
      return
    }
    if(!lastName) {
      swal('Validation Error', 'Please enter the last name', 'error')
      return
    }
  
    let gender = $('#gender').val()
    let maritalStatus = $('#maritalStatus').val()

    let address = $('#address').val()
    let personalEmail = $('#personalEmail').val()
		let telephone = $('#telephone').val()
		let mobileNumber = $('#mobileNumber').val()


		let plateNumber = $('#plate').val()

    if(!personalEmail) {
      swal('Validation Error', 'Please enter the email address', 'error')
      return
    }

    let user = {
      email: personalEmail,
      firstName,
      middleName,
      lastName,
      dateOfBirth: dateOfBirthAsDateObj,
      gender,
      maritalStatus,
      phoneNumber: telephone,
      mobileNumber,
      address,
      plateNumber,
      salesProfile: null
    }

    Meteor.call('account/create', user, false, (err, res) => {
      swal('Success', 'User was successfully created', 'success')
    })
  }
});

/*****************************************************************************/
/* AccountsCreate: Helpers */
/*****************************************************************************/
Template.AccountsCreate.helpers({
});

/*****************************************************************************/
/* AccountsCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.AccountsCreate.onCreated(function () {
});

Template.AccountsCreate.onRendered(function () {
  $('#datepicker-autoclose').datepicker();
});

Template.AccountsCreate.onDestroyed(function () {
});
