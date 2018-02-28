const joinMonster = require.main.require("../lib/join-monster")
const requireGraphql = require.main.require("../lib/require-graphql")

const type = requireGraphql(module, "./type")

const definitions = {
  Query: {
    fields: {
      user: {
        where: (table, { id }, { knex }) => {
          return knex.raw(`${table}.id = ?`, id).toString()
        },
        resolve: (parentValue, args, context, resolveInfo) =>
          joinMonster(resolveInfo),
      },

      users: {
        resolve: (parentValue, args, context, resolveInfo) =>
          joinMonster(resolveInfo),
      },
    },
  },
}

module.exports = { type, definitions }
