const definitions = {
  Event: {
    sqlTable: "event",
    uniqueKey: "id",
    fields: {
      organisationId: { sqlColumn: "organisationid" },

      name: { sqlColumn: "eventname" },
      additionalForm: { sqlColumn: "additionalform" },

      // tickets: {
      //   sqlJoin: (event, ticket) => `${event}.id = ${ticket}.eventid`,
      // },
    },
  },
}

module.exports = {
  type: require.main.require("../lib/require-graphql")(module, "./type"),
  definitions,
}
