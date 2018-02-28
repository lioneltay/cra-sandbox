const requireGraphql = require.main.require("../lib/require-graphql")

const type = requireGraphql(module, "./type")

const definitions = {
  OxilUserList: {
    sqlTable: `"oxil-user-list"`,
    uniqueKey: "id",
    fields: {
      id: { sqlColumn: "id" },
      organisationId: { sqlColumn: "organisationid" },
      name: { sqlColumn: "name" },
      description: { sqlColumn: "description" },
      createdAt: { sqlColumn: "createdat" },
      updatedAt: { sqlColumn: "updatedat" },

      users: {
        where: (userTable, args, { knex }, ast) => {
          const whereClauses = [
            {
              clause: `(${userTable}.archived = FALSE OR ${userTable}.archived IS NULL)`,
              variables: [],
            },
          ]

          return knex
            .raw(
              whereClauses.map(x => x.clause).join(" AND "),
              whereClauses.reduce((a, c) => a.concat(c.variables), [])
            )
            .toString()
        },
        junction: {
          sqlTable: `"oxil-list-user"`,
          sqlJoins: [
            (list, junction) => `${list}.id = ${junction}.listid`,
            (junction, user) => `${junction}.userid = ${user}.id`,
          ],
        },
      },

      numberOfUsers: {
        sqlExpr: list =>
          `(
            SELECT count(*) FROM "oxil-list-user" "junction"
            JOIN "oxil-user" "user"
              ON "user".id = "junction".userid
            WHERE listid = ${list}.id
              AND ("user".archived = FALSE OR "user".archived IS NULL)
          )`,
      }
    },
  },
}

module.exports = { type, definitions }
