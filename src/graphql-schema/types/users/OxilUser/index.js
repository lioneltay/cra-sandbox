const requireGraphql = require.main.require("../lib/require-graphql")

const type = requireGraphql(module, "./type")

const definitions = {
  OxilUser: {
    sqlTable: `"oxil-user"`,
    uniqueKey: "id",
    fields: {
      id: { sqlColumn: "id" },
      organisationId: { sqlColumn: "organisationid" },
      archived: { sqlColumn: "archived" },
      donorId: {
        sqlExpr: user =>
          `(SELECT id from "core-donor" where oxilUserId = ${user}.id)`,
      },
      hasAccount: {
        sqlExpr: user =>
          `((SELECT count(*) from "core-user" where oxilUserId = ${user}.id) > 0)`,
      },
      isDonor: {
        sqlExpr: user =>
          `((SELECT count(*) from "core-donor" where oxilUserId = ${user}.id) > 0)`,
      },
      isAttendee: {
        sqlExpr: user =>
          `((SELECT count(*) from "core-attendee" where oxilUserId = ${user}.id) > 0)`,
      },
      isFormRespondent: {
        sqlExpr: user =>
          `((SELECT count(*) from "form-respondent" where oxilUserId = ${user}.id) > 0)`,
      },
      isSurveyRespondent: {
        sqlExpr: user =>
          `((SELECT count(*) from "survey-respondent" where oxilUserId = ${user}.id) > 0)`,
      },
      createdAt: { sqlColumn: "createdat" },
      updatedAt: { sqlColumn: "updatedat" },
      firstName: { sqlColumn: "firstname" },
      lastName: { sqlColumn: "lastname" },
      fullName: {
        sqlDeps: ["firstname", "lastname"],
        resolve: ({ firstname, lastname }) =>
          [firstname, lastname].filter(Boolean).join(" "),
      },
      joinDate: { sqlColumn: "createdat" },
      phoneNumber: { sqlColumn: "phonenumber" },
      address: { sqlColumn: "address" },
      suburb: { sqlColumn: "suburb" },
      state: { sqlColumn: "state" },
      country: { sqlColumn: "country" },
      postCode: { sqlColumn: "postcode" },

      donationsCount: {
        sqlExpr: (userTable, args, context, ast) => {
          return `(
            SELECT count(*)
            FROM "core-payment" p
            JOIN "core-donor" d
              ON p.donorid = d.id
            WHERE oxiluserid = ${userTable}.id
          )`
        },
      },

      totalDonations: {
        sqlExpr: (userTable, args, context, ast) => {
          return `(
            SELECT SUM(amount)
            FROM "core-payment" p
            JOIN "core-donor" d
              ON p.donorid = d.id
            WHERE oxiluserid = ${userTable}.id
          )`
        },
      },

      // We have an unecessary core-donor table inbetween but we can treat it as a junction/join table. Beautiful!
      donations: {
        junction: {
          sqlTable: '"core-donor"',
          uniqueKey: "id",
          sqlBatch: {
            parentKey: "id",
            thisKey: "oxiluserid",
            sqlJoin: (junction, payment) =>
              `${junction}.id = ${payment}.donorid`,
          },
        },
      },

      formResponses: {
        where: (response, args, { knex }, ast) => {
          // console.log(ast)
          // console.log('\nAST')
          // console.log(ast.parent)
          // console.log('test', ast.parent.as)
          const user = `"${ast.parent.as}"`
          const parentTable = ast.parent.name
          const currentTable = ast.name
          return knex.raw(`${response}.firstname != 'first'`).toString()
          // return knex.raw(`(
          //   (
          //     SELECT count(*)
          //     FROM ${parentTable}
          //     JOIN ${currentTable}
          //       ON ${parentTable}.id = ${currentTable}.oxiluserid
          //     WHERE ${parentTable}.id = ${user}.id
          //   ) > 0
          // )`).toString()
        },
        sqlBatch: { parentKey: "id", thisKey: "oxiluserid" },
      },

      surveyResponses: {
        sqlBatch: { parentKey: "id", thisKey: "oxiluserid" },
      },

      eventTickets: {
        junction: {
          sqlTable: '"core-attendee"',
          uniqueKey: "id",
          sqlBatch: {
            parentKey: "id",
            thisKey: "oxiluserid",
            sqlJoin: (attendee, ticket) =>
              `${attendee}.id = ${ticket}.attendeeid`,
          },
        },
      },

      userLists: {
        junction: {
          sqlTable: '"oxil-list-user"',
          sqlJoins: [
            (user, junction) => `${user}.id = ${junction}.userid`,
            (junction, list) => `${junction}.listid = ${list}.id`,
          ],
        },
      },

      tags: {
        junction: {
          sqlTable: '"user-tag"',
          uniqueKey: ["tagid", "oxiluserid"],
          sqlBatch: {
            parentKey: "id",
            thisKey: "oxiluserid",
            sqlJoin: (junction, tag) => `${junction}.tagid = ${tag}.id`,
          },
        },
      },
    },
  },
}

module.exports = { type, definitions }
