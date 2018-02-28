const requireGraphql = require.main.require("../lib/require-graphql")

const type = requireGraphql(module, "./type")

const definitions = {
  Tag: {
    sqlTable: `"tag"`,
    uniqueKey: "name",
    fields: {
      id: { sqlColumn: "id" },
      organisationId: { sqlColumn: "organisationid" },
      name: { sqlColumn: "name" },

      users: {
        junction: {
          sqlTable: '"user-tag"',
          uniqueKey: ["tagid", "oxiluserid"],
          sqlBatch: {
            parentKey: "id",
            thisKey: "tagid",
            sqlJoin: (junction, user) => `${junction}.oxiluserid = ${user}.id`,
          },
        },
      },
      // users: {
      //   junction: {
      //     sqlTable: `"user-tag"`,
      //     uniqueKey: "id",
      //     sqlBatch: {
      //       parentKey: "id",
      //       thisKey: "tagid",
      //       sqlJoin: (junction, user) => `${junction}.oxiluserid = ${user}.id`,
      //     },
      //   },
      // },
    },
  },
}

module.exports = { type, definitions }
