const requireGraphql = require.main.require("../lib/require-graphql")

const type = requireGraphql(module, "./type")

const definitions = {
  User: {
    sqlTable: `"oxil-user-list"`,
    uniqueKey: "id",
    fields: {
      firstName: { sqlColumn: "firstname" },
      lastName: { sqlColumn: "lastname" },

      fullName: {
        sqlDeps: ["firstname", "lastname"],
        fullName: {
          resolve: ({ firstname, lastname }) =>
            [firstname, lastname].filter(Boolean).join(" "),
        },
      },

      createdAt: { sqlColumn: "createdat" },
      updatedAt: { sqlColumn: "updatedat" },

      nutritionLogs: {
        sqlJoin: (user, log) => `${user}.id = ${log}.userid`,
      },
    },
  },
}

module.exports = { type, definitions }
