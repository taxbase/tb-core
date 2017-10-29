Core.publish("AccountUsers", function (limit) {
    check(limit, Number);

    return Meteor.users.find({}, {limit: limit});
});
