const joinMonster = require.main.require("../lib/join-monster")

const definitions = {
  Query: {
    fields: {
      formResponses: {
        resolve: (root, args, context, info) => joinMonster(info),
      },
    },
  },
}

module.exports = {
  type: require.main.require("../lib/require-graphql")(module, "./type"),
  definitions,
}
