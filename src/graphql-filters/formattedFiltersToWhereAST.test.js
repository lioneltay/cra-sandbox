const R = require("ramda")

const {
  formattedFiltersToWhereAST,
} = require("./formattedFiltersToWhereAST.js")

test("formattedFiltersToWhereAST: test 1", () => {
  const formattedFilters = {
    AND: [
      { createdAt: { gt: "2028-2-2" } },
      { joinDate: { lt: 3 } },
      { joinDate: { gt: 7 } },
      { joinDate: { in: [1, 2, 3, 4, 5] } },
    ],
  }

  const whereAST = {
    AND: [
      { clause: `table.createdAt > ?`, variables: ["2028-2-2"] },
      { clause: `table.joinDate < ?`, variables: [3] },
      { clause: `table.joinDate > ?`, variables: [7] },
      {
        clause: `table.joinDate in (?, ?, ?, ?, ?)`,
        variables: [1, 2, 3, 4, 5],
      },
    ],
  }

  expect(
    formattedFiltersToWhereAST(formattedFilters, { tableName: "table" })
  ).toEqual(whereAST)
})

test("formattedFiltesrToWhereAST: more complex", () => {
  const formattedFilters = {
    AND: [
      { createdAt: { gt: "2028-2-2" } },
      {
        OR: [
          {
            AND: [{ cost: { gt: 3 } }, { cost: { lt: 5 } }],
          },
          {
            AND: [{ id: { in: [2, 5, 8, 9] } }, { cost: { gt: 20 } }],
          },
        ],
      },
    ],
  }

  const ast = {
    AND: [
      { clause: "table.createdAt > ?", variables: ["2028-2-2"] },
      {
        OR: [
          {
            AND: [
              { clause: "table.cost > ?", variables: [3] },
              { clause: "table.cost < ?", variables: [5] },
            ],
          },
          {
            AND: [
              { clause: "table.id in (?, ?, ?, ?)", variables: [2, 5, 8, 9] },
              { clause: "table.cost > ?", variables: [20] },
            ],
          },
        ],
      },
    ],
  }

  expect(
    formattedFiltersToWhereAST(formattedFilters, { tableName: "table" })
  ).toEqual(ast)
})

test("formattedFiltesrToWhereAST: handles sqlColumn aliases", () => {
  const schema = {
    fields: {
      joinDate: { sqlColumn: "createdat" },
      donationsCount: { sqlExpr: `(SELECT COUNT(*) from "the-table")` },
      tableCount: { sqlExpr: table => `(SELECT COUNT(*) from ${table})` },
    },
  }

  const formattedFilters = {
    AND: [
      { joinDate: { gt: "2028-2-2" } },
      { donationsCount: { gt: 1000 } },
      { tableCount: { gt: 2000 } },
      {
        OR: [
          {
            AND: [{ cost: { gt: 3 } }, { cost: { lt: 5 } }],
          },
          {
            AND: [{ id: { in: [2, 5, 8, 9] } }, { cost: { gt: 20 } }],
          },
        ],
      },
    ],
  }

  const ast = {
    AND: [
      { clause: "table.createdat > ?", variables: ["2028-2-2"] },
      { clause: `(SELECT COUNT(*) from "the-table") > ?`, variables: [1000] },
      { clause: `(SELECT COUNT(*) from table) > ?`, variables: [2000] },
      {
        OR: [
          {
            AND: [
              { clause: "table.cost > ?", variables: [3] },
              { clause: "table.cost < ?", variables: [5] },
            ],
          },
          {
            AND: [
              { clause: "table.id in (?, ?, ?, ?)", variables: [2, 5, 8, 9] },
              { clause: "table.cost > ?", variables: [20] },
            ],
          },
        ],
      },
    ],
  }

  expect(
    formattedFiltersToWhereAST(formattedFilters, {
      schema,
      tableName: "table",
    })
  ).toEqual(ast)
})
