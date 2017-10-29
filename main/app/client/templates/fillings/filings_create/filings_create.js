/*****************************************************************************/
/* FilingsCreate: Event Handlers */
/*****************************************************************************/
Template.FilingsCreate.events({
	'submit .fillingsCreateForm'(event) {
		event.preventDefault();

		const form = document.forms.filingsCreate
		const declarationCheckbox = form.declarationCheckbox.checked

		if (!declarationCheckbox && isValidForm) {
			
		}

		const formDetails = {
			submissionDate: form.submissionDate.value,
			totalSalesVATExclusive: form.totalSalesVATExclusive.value,
			goodsAndServicesExempted: form.goodsAndServicesExempted.value,
			zeroRatedGoodsAndServices: form.zeroRatedGoodsAndServices.value,
			salesAdjusted: form.salesAdjusted.value,
			salesIncomeSubjectToVat: form.salesIncomeSubjectToVat.value,
			purchasesNotUsedInZeroRatedSupplies: form.purchasesNotUsedInZeroRatedSupplies.value,
			purchasesNotUsedInVATSupplies: form.purchasesNotUsedInVATSupplies.value,
			domesticPurchases: form.domesticPurchases.value,
			importsPurchased: form.importsPurchased.value,
			vatOnDomesticSupplies: form.vatOnDomesticSupplies.value,
			domesticPurchasesForZeroRatedSales: form.domesticPurchasesForZeroRatedSales.value,
			vatOnZeroSupplies: form.vatOnZeroSupplies.value,
			totalPurchasesSubjectToVat: form.totalPurchasesSubjectToVat.value,
			inputTaxOnVatWithheldByMda: form.inputTaxOnVatWithheldByMda.value,
			netVatBalance: form.netVatBalance.value,
			automaticVatPayment: form.automaticVatPayment.value,
			vatCreditBroughtForward: form.vatCreditBroughtForward.value,
			totalVatCredit: form.totalVatCredit.value,
			relievedVatCredit: form.relievedVatCredit.value,
			vatCreditCarriedForward: form.vatCreditCarriedForward.value,
		}

		console.log('called :', formDetails)		

		Meteor.call('filings.create', formDetails)
	}
});

/*****************************************************************************/
/* FilingsCreate: Helpers */
/*****************************************************************************/
Template.FilingsCreate.helpers({
});

/*****************************************************************************/
/* FilingsCreate: Lifecycle Hooks */
/*****************************************************************************/
Template.FilingsCreate.onCreated(function () {
});

Template.FilingsCreate.onRendered(function () {
});

Template.FilingsCreate.onDestroyed(function () {
});
