const requireGraphql = require.main.require("../lib/require-graphql")

const type = requireGraphql(module, "./type")

const definitions = {
  NutritionLog: {
    sqlTable: `"challenger-logging-nutrition"`,
    uniqueKey: "id",
    fields: {
      userId: { sqlColumn: "userid" },
      cardId: { sqlColumn: "cardid" },
      foodId: { sqlColumn: "foodid" },
      amount: { sqlColumn: "amount" },
      isComboCard: { sqlColumn: "iscombocard" },
      isUserCreatedCard: { sqlColumn: "isusercreatedcard" },

      createdAt: { sqlColumn: "createdat" },
      updatedAt: { sqlColumn: "updatedat" },

      user: {
        sqlJoin: (logTable, userTable) =>
          `${logTable}.userid = ${userTable}.id`,
      },
    },
  },
}

module.exports = { type, definitions }
