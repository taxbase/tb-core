Core.publish("Transaction", function (id) {
    return Transactions.find({_id: id});
});

Core.publish("Transactions", function (limit) {
    check(limit, Number);

    return Transactions.find({}, {limit: limit, sort: {fileDate: -1}});
});

