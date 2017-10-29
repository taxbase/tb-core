Core.Schemas.Transaction = new SimpleSchema({
    _id: {
        type: String,
        optional: true
    },
    payId: {
		optional: true,
        type: String
    },
    fileDate: {
		optional: true,
        type: Date
    },
    amount: {
        type: Number,
		decimal: true,
		optional: true
    }
});
