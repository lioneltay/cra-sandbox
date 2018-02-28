const joinMonster = require.main.require("../lib/join-monster")

const definitions = {
  Query: {
    fields: {
      event: {
        where: (event, { id, orgId }, { knex }) => {
          return knex
            .raw(`${event}.id = ? AND ${event}.organisationid = ?`, [id, orgId])
            .toString()
        },
        resolve: joinMonster.infoOnly,
      },

      events: {
        where: (event, { orgId }, { knex }) => {
          return knex.raw(`${event}.organisationid = ?`, orgId).toString()
        },
        resolve: joinMonster.infoOnly,
      },
    },
  },
}

module.exports = {
  type: require.main.require("../lib/require-graphql")(module, "./type"),
  definitions,
}
