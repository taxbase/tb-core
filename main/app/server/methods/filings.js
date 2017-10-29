Meteor.methods({
	'filings.create'(formDetails) {
		Fillings.insert(formDetails)
	}
})