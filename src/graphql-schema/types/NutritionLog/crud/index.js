const joinMonster = require.main.require("../lib/join-monster")
const requireGraphql = require.main.require("../lib/require-graphql")

const type = requireGraphql(module, "./type")

const definitions = {
  Query: {
    fields: {
      nutritionLogs: {
        where: (table, { id }, { knex }) =>
          knex.raw(`${table}.id = ?`, id).toString(),
        resolve: (parentValue, args, context, resolveInfo) =>
          joinMonster(resolveInfo),
      },
      nutritionLog: {
        resolve: (parentValue, args, context, resolveInfo) =>
          joinMonster(resolveInfo),
      },
    },
  },
}

module.exports = { type, definitions }
