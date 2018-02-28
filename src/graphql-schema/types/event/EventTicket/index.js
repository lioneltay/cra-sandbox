const definitions = {
  EventTicket: {
    sqlTable: `"event-ticket-reserved"`,
    uniqueKey: "id",
    fields: {
      id: { sqlColumn: "id" },
      eventId: { sqlColumn: "eventid" },
      code: { sqlColumn: "reservedcode" },
      checkInDate: { sqlColumn: "checkindate" },
      formData: { sqlColumn: "formdata" },
      groupBookingFormData: { sqlColumn: "groupbookingformdata" },

      ticket: {
        sqlJoin: (reserved, ticket) => `${reserved}.ticketid = ${ticket}.id`,
      },

      event: {
        sqlJoin: (reserved, event) => `${reserved}.eventid = ${event}.id`,
      },
    },
  },
}

module.exports = {
  type: require.main.require("../lib/require-graphql")(module, "./type"),
  definitions,
}
