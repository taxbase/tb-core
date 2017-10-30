Meteor.methods({
	'transactions/totalAggregateSummary'(summaryType) {
    console.log(`summaryType: `, summaryType)

    let dateQueryStart = null;
    let dateQueryEnd = moment().subtract(1, 'day').endOf('day').toDate();

    if(summaryType === 'year') {
      dateQueryStart = moment().startOf('year').startOf('day').toDate();
    } else if(summaryType === 'month') {
      dateQueryStart = moment().startOf('month').startOf('day').toDate();
    } else if(summaryType === 'week') {
      dateQueryStart = moment().startOf('week').startOf('day').toDate();      
    }

    // let transactionsForSummary = Transactions.aggregate([
    //   {"$match": {
    //     fileDate: {$gte: dateQueryStart, $lte: dateQueryEnd}
    //   }},
    //   {
    //     "$group": {
    //       _id: {},
    //       count: {$sum: 1},
    //       totalAmount: {$sum: "$amount"},
    //     }
    //   }
    // ]);
    // console.log(`transactionsForSummary: `, transactionsForSummary)

    transactionsForSummary = {
      totalIncome: 3838383838,
      totalVatableIncome: 3383838383,
      vat: 8838383
    }
    return transactionsForSummary;
	}
})