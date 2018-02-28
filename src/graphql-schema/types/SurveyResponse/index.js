const definitions = {
  SurveyResponse: {
    sqlTable: `"survey-respondent"`,
    uniqueKey: "id",
    fields: {
      createdAt: { sqlColumn: "createdat" },
      updatedAt: { sqlColumn: "updatedat" },
      id: { sqlColumn: "id" },

      firstName: { sqlColumn: "firstname" },
      lastName: { sqlColumn: "lastname" },
      phoneNumber: { sqlColumn: "phonenumber" },
      address: { sqlColumn: "address" },
      suburb: { sqlColumn: "suburb" },
      country: { sqlColumn: "country" },
      state: { sqlColumn: "state" },
      postCode: { sqlColumn: "postcode" },
      dob: { sqlColumn: "dateofbirth" },
      email: { sqlColumn: "email" },

      oxilUser: {
        sqlJoin: (respondent, user) => `${respondent}.oxiluserid = ${user}.id`,
      },
    },
  },
}

module.exports = {
  type: require.main.require("../lib/require-graphql")(module, "./type"),
  definitions,
}
