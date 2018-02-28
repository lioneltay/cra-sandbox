const definitions = {
  ChallengerNews: {
    sqlTable: `"challenger-news"`,
    uniqueKey: "id",
    fields: {
      createdAt: { sqlColumn: "createdat" },
      updatedAt: { sqlColumn: "updatedat" },
      id: { sqlColumn: "id" },
      organisationId: { sqlColumn: "organisationid" },
      groupId: { sqlColumn: "groupid" },

      title: {
        sqlColumn: "title",
        resolve: parent => parent.title || "",
      },
      thumbnailURL: {
        sqlColumn: "thumbnailurl",
        resolve: parent => parent.thumbnailURL || "",
      },
      content: {
        sqlColumn: "content",
        resolve: parent => parent.content || "",
      },
      published: {
        sqlColumn: "published",
        resolve: parent => !!parent.published,
      },
      sticky: {
        sqlColumn: "sticky",
        resolve: parent => !!parent.sticky,
      },
      emphasized: {
        sqlColumn: "emphasized",
        resolve: parent => !!parent.emphasized,
      },
    },
  },
}

module.exports = {
  type: require.main.require("../lib/require-graphql")(module, "./type"),
  definitions,
}
