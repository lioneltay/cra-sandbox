const R = require("ramda")
const sqlFormatter = require("sql-formatter")

const { generateWhereClause } = require("./index.js")

test("generateWhereClause: test", () => {
  const filters = {
    createdAt: { gt: "2028-2-2" },
    OR: [
      { cost: { lt: 3 } },
      {
        AND: [{ id: { in: [2, 5, 8, 9] } }, { cost: { gt: 20 } }],
      },
    ],
  }

  const sql = sqlFormatter.format(`
  (
    table.createdAt > '2028-2-2'
    AND (
      table.cost < 3
      OR (
        table.id in (2,5,8,9)
        AND table.cost > 20
      )
    )
  )
`)

  expect(
    generateWhereClause(filters, { schema: {}, tableName: "table" })
  ).toEqual(sql)
})

test("generateWhereClause: test 2 complex", () => {
  const filters = {
    AND: [
      { createdAt: { gt: "2028-2-2" } },
      {
        OR: [
          { cost: { lt: 3 } },
          {
            AND: [
              { id: { in: [2, 5, 8, 9] } },
              { cost: { gt: 20 } },
              {
                AND: [{ cost: { gt: 20 } }, { cost: { lt: 30 } }],
              },
            ],
          },
        ],
      },
    ],
  }

  const sql = sqlFormatter.format(`
    (
      table.createdAt > '2028-2-2'
      AND (
        table.cost < 3
        OR (
          table.id in (2,5,8,9)
          AND table.cost > 20
          AND table.cost > 20
          AND table.cost < 30
        )
      )
    )
  `)

  expect(
    generateWhereClause(filters, { schema: {}, tableName: "table" })
  ).toEqual(sql)
})

test("generateWhereClause: test 3 complex", () => {
  const filters = {
    AND: [
      { createdAt: { gt: "2028-2-2" } },
      {
        OR: [
          { cost: { lt: 3 } },
          {
            AND: [
              { id: { in: [2, 5, 8, 9] } },
              { cost: { gt: 20 } },
              {
                OR: [{ name: { like: "A%" } }, { name: { regex: ".*A^" } }],
              },
              {
                AND: [{ cost: { gt: 20 } }, { cost: { lt: 30 } }],
              },
            ],
          },
        ],
      },
    ],
  }

  const sql = sqlFormatter.format(`
  (
    table.createdAt > '2028-2-2'
    AND (
      table.cost < 3
      OR (
        table.id in (2,5,8,9)
        AND table.cost > 20
        AND (
          table.name LIKE 'A%'
          OR table.name REGEX '.*A^'
        )
        AND table.cost > 20
        AND table.cost < 30
      )
    )
  )
`)

  expect(
    generateWhereClause(filters, { schema: {}, tableName: "table" })
  ).toEqual(sql)
})

test("generateWhereClause: schemas", () => {
  const schema = {
    fields: {
      joinDate: { sqlColumn: "createdat" },
      somecount: { sqlExpr: `(SELECT COUNT(*) from "the-table")` },
      whatcount: { sqlExpr: table => `(SELECT COUNT(*) from ${table})` },
    },
  }

  const filters = {
    joinDate: { gt: "2028-2-2" },
    somecount: { gt: 1000 },
    OR: [
      { whatcount: { gt: 2000 } },
      { cost: { lt: 3 } },
      {
        AND: [{ id: { in: [2, 5, 8, 9] } }, { cost: { gt: 20 } }],
      },
    ],
  }

  const sql = sqlFormatter.format(`
    (
      table.createdat > '2028-2-2'
      AND (SELECT COUNT(*) from "the-table") > 1000
      AND (
        (SELECT COUNT(*) from table) > 2000
        OR table.cost < 3
        OR (
          table.id in (2,5,8,9)
          AND table.cost > 20
        )
      )
    )
  `)

  expect(generateWhereClause(filters, { schema, tableName: "table" })).toEqual(
    sql
  )
})
