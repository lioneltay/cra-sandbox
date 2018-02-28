const requireGraphql = require.main.require("../lib/require-graphql")
const joinMonster = require.main.require("../lib/join-monster")
const R = require("ramda")

const type = requireGraphql(module, "./type")

const definitions = {
  Query: {
    fields: {
      tag: {
        where: (tagTable, { tagId, orgId }, { knex }) => {
          return knex
            .raw(`${tagTable}.id = ? AND ${tagTable}.organisationid = ?`, [
              tagId,
              orgId,
            ])
            .toString()
        },
        resolve: (parent, args, context, info) => {
          return joinMonster(info)
        },
      },

      tags: {
        where: (tagTable, { orgId }, { knex }) => {
          return knex.raw(`${tagTable}.organisationid = ?`, [orgId]).toString()
        },
        resolve: (parent, args, context, info) => {
          return joinMonster(info)
        },
      },
    },
  },

  Mutation: {
    fields: {
      createTag: {
        where: (tagTable, { orgId }, { knex }) => {
          return knex.raw(`${tagTable}.organisationid = ?`, [orgId]).toString()
        },
        resolve: async (parent, { orgId, name }, { knex }, info) => {
          const tags = await knex("tag")
            .select("*")
            .where({ name })
          if (tags.length === 0) {
            await knex("tag").insert({ organisationid: orgId, name })
          }
          return joinMonster(info)
        },
      },

      deleteTag: {
        where: (tagTable, { tagId, orgId }, { knex }) => {
          return knex
            .raw(`${tagTable}.id = ? AND ${tagTable}.organisationid = ?`, [
              tagId,
              orgId,
            ])
            .toString()
        },
        resolve: async (parent, { tagId, orgId }, { knex }) => {
          await knex("tag")
            .where({ id: tagId, organisationid: orgId })
            .del()
          return tagId
        },
      },

      updateTag: {
        where: (tagTable, { tagId, orgId }, { knex }) => {
          return knex
            .raw(`${tagTable}.id = ? AND ${tagTable}.organisationid = ?`, [
              tagId,
              orgId,
            ])
            .toString()
        },
        resolve: async (parent, { orgId, tagId, name }, { knex }, info) => {
          await knex("tag")
            .where({ id: tagId, organisationid: orgId })
            .update({ name })
          return joinMonster(info)
        },
      },

      assignTagsToUser: {
        where: (userTable, { userId, orgId }, { knex }) => {
          return knex
            .raw(`${userTable}.id = ? AND ${userTable}.organisationid = ?`, [
              userId,
              orgId,
            ])
            .toString()
        },
        resolve: async (parent, { orgId, tags, userId }, { knex }, info) => {
          const existingTags = await knex("tag")
            .select("*")
            .where({ organisationid: orgId })
            .whereIn("name", tags)

          const newTagNames = tags.filter(
            tag => !R.contains(tag, existingTags.map(tag => tag.name))
          )

          await knex("tag").insert(
            newTagNames.map(name => ({ name, organisationid: orgId }))
          )

          const updatedExistingTags = await knex("tag")
            .select("*")
            .where({ organisationid: orgId })
            .whereIn("name", tags)

          await knex("user-tag").insert(
            updatedExistingTags.map(tag => ({
              tagid: tag.id,
              organisationid: orgId,
              oxiluserid: userId,
            }))
          )
          return joinMonster(info)
        },
      },

      setUserTags: {
        where: (userTable, { userId, orgId }, { knex }) => {
          return knex
            .raw(`${userTable}.id = ? AND ${userTable}.organisationid = ?`, [
              userId,
              orgId,
            ])
            .toString()
        },
        resolve: async (parent, { orgId, tags, userId }, { knex }, info) => {
          const existingTags = await knex("tag")
            .select("*")
            .where({ organisationid: orgId })
            .whereIn("name", tags)

          const newTagNames = tags.filter(
            tag => !R.contains(tag, existingTags.map(tag => tag.name))
          )

          await knex("tag").insert(
            newTagNames.map(name => ({ name, organisationid: orgId }))
          )

          const updatedExistingTags = await knex("tag")
            .select("*")
            .where({ organisationid: orgId })
            .whereIn("name", tags)

          await knex("user-tag")
            .where({ organisationid: orgId, oxiluserid: userId })
            .del()

          await knex("user-tag").insert(
            updatedExistingTags.map(tag => ({
              tagid: tag.id,
              organisationid: orgId,
              oxiluserid: userId,
            }))
          )
          return joinMonster(info)
        },
      },

      unassignTagsFromUser: {
        where: (userTable, { userId, orgId }, { knex }) => {
          return knex
            .raw(`${userTable}.id = ? AND ${userTable}.organisationid = ?`, [
              userId,
              orgId,
            ])
            .toString()
        },
        resolve: async (parent, { orgId, tags, userId }, { knex }, info) => {
          const existingTags = await knex("tag")
            .select("*")
            .where({ organisationid: orgId })
            .whereIn("name", tags)

          const tagIds = existingTags.map(tag => tag.id)

          await knex("user-tag")
            .where({ organisationid: orgId, oxiluserid: userId })
            .whereIn("tagid", tagIds)
            .del()

          return joinMonster(info)
        },
      },
    },
  },
}

module.exports = { type, definitions }
