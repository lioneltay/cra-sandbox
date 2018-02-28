const joinMonster = require.main.require("../lib/join-monster")
const requireGraphql = require.main.require("../lib/require-graphql")
const R = require("ramda")

const type = requireGraphql(module, "./type")

const definitions = {
  Query: {
    fields: {
      oxilUsers: {
        where: (
          userTable,
          { orgId, filters, orderBy, limit },
          { knex },
          ast
        ) => {
          console.log("@@@@@@@@@Filters@@@@@@@@@")
          console.log(filters)

          const whereClauses = [
            { clause: `${userTable}.organisationid = ?`, variables: [orgId] },
            {
              clause: `(${userTable}.archived = FALSE OR ${userTable}.archived IS NULL)`,
              variables: [],
            },
          ]

          // This could be abstracted by a schema -> column/expression mapping
          if (filters) {
            if (filters.joinDate) {
              const joinDate = filters.joinDate

              if (!R.isNil(joinDate.gt)) {
                whereClauses.push({
                  clause: `${userTable}.createdat >= ?`,
                  variables: [joinDate.gt],
                })
              }
            }

            if (filters.totalDonations) {
              const totalDonations = filters.totalDonations

              if (!R.isNil(totalDonations.gt)) {
                whereClauses.push({
                  clause: `(
                    SELECT SUM(amount)
                    FROM "core-payment" p
                    JOIN "core-donor" d
                      ON p.donorid = d.id
                    WHERE oxiluserid = ${userTable}.id
                  ) > ?`,
                  variables: [totalDonations.gt],
                })
              }
            }

            if (filters.donationsCount) {
              const donationsCount = filters.donationsCount

              if (!R.isNil(donationsCount.gt)) {
                whereClauses.push({
                  clause: `(
                    SELECT count(*)
                    FROM "core-payment" p
                    JOIN "core-donor" d
                      ON p.donorid = d.id
                    WHERE oxiluserid = ${userTable}.id
                  ) > ?`,
                  variables: [donationsCount.gt],
                })
              }
            }
          }

          return knex
            .raw(
              whereClauses.map(x => x.clause).join(" AND "),
              whereClauses.reduce((a, c) => a.concat(c.variables), [])
            )
            .toString()
        },
        orderBy: ({ orderBy = { joinDate: "desc" } }, context) => {
          const adjust = key => {
            switch (key) {
              case "joinDate": {
                return "createdat"
              }
              default: {
                return key
              }
            }
          }

          return R.pipe(
            R.toPairs,
            R.map(([k, v]) => [adjust(k), v]),
            R.fromPairs
          )(orderBy)
        },
        limit: (args, context) => {
          return args.limit
        },
        resolve: (root, args, context, info) => joinMonster(info),
      },

      oxilUser: {
        where: (userTable, { orgId, id }, { knex }) => {
          return knex
            .raw(
              `${userTable}.organisationid = ? AND ${userTable}.id = ? AND (${userTable}.archived = FALSE OR ${userTable}.archived IS NULL)`,
              [orgId, id]
            )
            .toString()
        },
        resolve: (root, args, context, info) => joinMonster(info),
      },
    },
  },

  Mutation: {
    fields: {
      updateOxilUser: {
        where: (userTable, { orgId, id }, { knex }) => {
          return knex
            .raw(`${userTable}.organisationid = ? AND ${userTable}.id = ?`, [
              orgId,
              id,
            ])
            .toString()
        },
        resolve: async (root, { orgId, id, userInput }, { models }, info) => {
          const user = await models["oxil-user"].findOne({
            where: { organisationId: orgId, id },
          })

          if (!user) {
            throw Error("No such user")
          }

          await user.updateAttributes(userInput)
          return joinMonster(info)
        },
      },

      archiveOxilUsers: {
        where: (userTable, { orgId, ids }, { knex }) => {
          const inValue = ids
            .map(x => parseInt(x))
            .filter(x => x === x)
            .join(", ")
          return knex
            .raw(
              `${userTable}.organisationid = ? AND ${userTable}.id IN (${inValue})`,
              [orgId]
            )
            .toString()
        },
        resolve: async (root, { orgId, ids }, { models }, info) => {
          const users = await models["oxil-user"].find({
            where: { organisationId: orgId, id: { inq: ids } },
          })

          await Promise.all(
            users.map(user => user.updateAttributes({ archived: true }))
          )

          return joinMonster(info)
        },
      },

      unarchiveOxilUsers: {
        where: (userTable, { orgId, ids }, { knex }) => {
          const inValue = ids
            .map(x => parseInt(x))
            .filter(x => x === x)
            .join(", ")
          return knex
            .raw(
              `${userTable}.organisationid = ? AND ${userTable}.id IN (${inValue})`,
              [orgId]
            )
            .toString()
        },
        resolve: async (root, { orgId, ids }, { models }, info) => {
          const users = await models["oxil-user"].find({
            where: { organisationId: orgId, id: { inq: ids } },
          })

          await Promise.all(
            users.map(user => user.updateAttributes({ archived: false }))
          )

          return joinMonster(info)
        },
      },
    },
  },
}

module.exports = { type, definitions }
