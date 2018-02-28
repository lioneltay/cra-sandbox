const definitions = {
  Payment: {
    sqlTable: `"core-payment"`,
    uniqueKey: "id",
    fields: {
      createdAt: { sqlColumn: "createdat" },
      updatedAt: { sqlColumn: "updatedat" },
      id: { sqlColumn: "id" },
      organisationId: { sqlColumn: "organisationid" },
      donorId: { sqlColumn: "donorid" },
      groupId: { sqlColumn: "groupid" },
      userId: { sqlColumn: "userid" },
      attendeeId: { sqlColumn: "attendeeid" },
      eventId: { sqlColumn: "eventid" },
      orderId: { sqlColumn: "orderid" },

      firstName: { sqlColumn: "firstname" },
      lastName: { sqlColumn: "lastname" },
      currency: { sqlColumn: "currency" },
      receiptId: { sqlColumn: "receiptid" },
      amount: { sqlColumn: "amount" },
    },
  },
}

module.exports = {
  type: require.main.require("../lib/require-graphql")(module, "./type"),
  definitions,
}
