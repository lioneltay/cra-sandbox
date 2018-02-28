const joinMonster = require.main.require("../lib/join-monster")
const R = require("ramda")

const definitions = {
  Query: {
    fields: {
      challengerNewsAll: {
        where: (news, { orgId, groupId, filters }, { knex }, ast) => {
          const whereClauses = [
            { clause: `${news}.organisationid = ?`, variables: [orgId] },
          ]

          if (groupId) {
            whereClauses.push({
              clause: `${news}.groupid = ?`,
              variables: [groupId],
            })
          }

          if (filters) {
            if (filters.published) {
              if (!R.isNil(filters.published.equals)) {
                whereClauses.push({
                  clause: filters.published.equals
                    ? `${news}.published = ?`
                    : `(${news}.published = ? OR ${news}.published IS NULL)`,
                  variables: [filters.published.equals],
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
        resolve: (parent, args, context, info) => {
          return joinMonster(info)
        },
      },
    },
  },

  Mutation: {
    fields: {
      createNews: {
        where: (news, { orgId, groupId }, { newsId, knex }, ast) => {
          const whereClauses = [
            { clause: `${news}.organisationid = ?`, variables: [orgId] },
            { clause: `${news}.id = ?`, variables: [newsId] },
          ]

          if (groupId) {
            whereClauses.push({
              clause: `${news}.groupid = ?`,
              variables: [groupId],
            })
          }

          return knex
            .raw(
              whereClauses.map(x => x.clause).join(" AND "),
              whereClauses.reduce((a, c) => a.concat(c.variables), [])
            )
            .toString()
        },
        resolve: async (
          parent,
          {
            orgId,
            groupId,
            title,
            thumbnailURL,
            content,
            published,
            sticky,
            emphasized,
          },
          { knex },
          info
        ) => {
          const [{ id: newsId }] = await knex("challenger-news")
            .insert({
              organisationid: orgId,
              groupid: groupId,
              title,
              thumbnailurl: thumbnailURL,
              content,
              published,
              sticky,
              emphasized,
            })
            .returning(["id"])

          console.log("@@@@@@@@", newsId)

          return joinMonster(info, { newsId })
        },
      },

      updateNews: {
        where: (news, { orgId, groupId, newsId }, { knex }, ast) => {
          const whereClauses = [
            { clause: `${news}.organisationid = ?`, variables: [orgId] },
            { clause: `${news}.id = ?`, variables: [newsId] },
          ]

          if (groupId) {
            whereClauses.push({
              clause: `${news}.groupid = ?`,
              variables: [groupId],
            })
          }

          return knex
            .raw(
              whereClauses.map(x => x.clause).join(" AND "),
              whereClauses.reduce((a, c) => a.concat(c.variables), [])
            )
            .toString()
        },
        resolve: async (
          parent,
          {
            orgId,
            groupId,
            newsId,
            title,
            thumbnailURL,
            content,
            published,
            sticky,
            emphasized,
          },
          { knex },
          info
        ) => {
          const whereClause = {
            organisationid: orgId,
            id: newsId,
          }

          if (groupId) {
            whereClause.groupid = groupId
          }

          await knex("challenger-news")
            .where(whereClause)
            .update({
              organisationid: orgId,
              groupid: groupId,
              title,
              thumbnailurl: thumbnailURL,
              content,
              published,
              sticky,
              emphasized,
            })

          return joinMonster(info)
        },
      },

      deleteNews: {
        resolve: async (parent, { orgId, groupId, newsId }, { knex }, info) => {
          const whereClause = {
            organisationid: orgId,
            id: newsId,
          }

          if (groupId) {
            whereClause.groupid = groupId
          }

          await knex("challenger-news")
            .where(whereClause)
            .del()

          console.log(whereClause)
          console.log(newsId)

          return newsId
        },
      },
    },
  },
}

module.exports = {
  type: require.main.require("../lib/require-graphql")(module, "./type"),
  definitions,
}
