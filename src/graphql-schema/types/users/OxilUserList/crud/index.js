const joinMonster = require.main.require("../lib/join-monster")
const requireGraphql = require.main.require("../lib/require-graphql")
const R = require("ramda")

const type = requireGraphql(module, "./type")

const definitions = {
  Query: {
    fields: {
      oxilUserList: {
        where: (table, { id, orgId }, { knex }) => {
          return knex
            .raw(`${table}.id = ? AND ${table}.organisationid = ?`, [id, orgId])
            .toString()
        },
        resolve: (parentValue, args, context, resolveInfo) =>
          joinMonster(resolveInfo),
      },

      oxilUserLists: {
        where: (table, { orgId }, { knex }) => {
          return knex.raw(`${table}.organisationid = ?`, orgId).toString()
        },
        resolve: (parentValue, args, context, resolveInfo) =>
          joinMonster(resolveInfo),
      },
    },
  },

  Mutation: {
    fields: {
      createOxilUserList: {
        where: (table, args, { knex, id }) => {
          return knex.raw(`${table}.id = ?`, id).toString()
        },
        resolve: async (
          parentValue,
          { orgId, userIds, input },
          { knex, models },
          resolveInfo
        ) => {
          const [{ id: listId }] = await knex("oxil-user-list")
            .insert(R.merge(input, { organisationid: orgId }))
            .returning(["id"])

          if (userIds) {
            await knex("oxil-list-user").insert(
              userIds.map(id => ({ userid: id, listid: listId }))
            )
          }

          return joinMonster(resolveInfo, { id: listId })
        },
      },

      updateOxilUserList: {
        where: (table, { id }, { knex }) => {
          return knex.raw(`${table}.id = ?`, id).toString()
        },
        resolve: async (
          parentValue,
          { orgId, id, input },
          { models },
          resolveInfo
        ) => {
          await models["oxil-user-list"]
            .findOne({ where: { organisationId: orgId, id } })
            .then(list => {
              if (!list) {
                throw Error('No such list')
              }
              return list.updateAttributes(input)
            })

          return joinMonster(resolveInfo, { id })
        },
      },

      deleteOxilUserList: {
        where: (table, { id }, { knex }) => {
          return knex.raw(`${table}.id = ?`, id).toString()
        },
        resolve: async (parentValue, { orgId, id }, { knex }, resolveInfo) => {
          await knex("oxil-user-list")
            .where({ organisationid: orgId, id })
            .del()

          return id
        },
      },

      assignToUserList: {
        where: (table, { orgId, input: { listId } }, { knex }) => {
          return knex
            .raw(`${table}.id = ? AND ${table}.organisationid = ?`, [
              listId,
              orgId,
            ])
            .toString()
        },
        resolve: async (
          root,
          { orgId, input: { userIds, listId } },
          { knex, models },
          info
        ) => {
          await knex("oxil-list-user").insert(
            userIds.map(userid => ({ userid, listid: listId }))
          )

          return joinMonster(info)
        },
      },

      unassignToUserList: {
        where: (table, { orgId, input: { listId } }, { knex }) => {
          return knex
            .raw(`${table}.id = ? AND ${table}.organisationid = ?`, [
              listId,
              orgId,
            ])
            .toString()
        },
        resolve: async (
          root,
          { input: { userIds, listId } },
          { knex, models },
          info
        ) => {
          await knex("oxil-list-user")
            .where({ listid: listId })
            .whereIn("userid", userIds)
            .del()

          return joinMonster(info)
        },
      },
    },
  },
}

module.exports = { type, definitions }
