const joinMonster = require.main.require("../lib/join-monster")

const definitions = {
  Query: {
    fields: {
      payment: {
        resolve: (root, args, context, info) => joinMonster(info),
      },
      payments: {
        resolve: (root, args, context, info) => joinMonster(info),
      },
    },
  },
}

module.exports = {
  type: require.main.require("../lib/require-graphql")(module, "./type"),
  definitions,
}
