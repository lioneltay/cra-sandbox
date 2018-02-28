const definitions = {
  EventTicketType: {
    sqlTable: `"event-tickets"`,
    uniqueKey: "id",
    fields: {
      id: { sqlColumn: "id" },
      eventId: { sqlColumn: "eventid" },
      description: { sqlColumn: "description" },
      admits: { sqlColumn: "equivalentpax" },
      name: { sqlColumn: "ticketname" },
      quantity: { sqlColumn: "quantity" },
    },
  },
}

module.exports = {
  type: require.main.require("../lib/require-graphql")(module, "./type"),
  definitions,
}
