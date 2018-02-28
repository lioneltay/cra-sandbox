const R = require("ramda")
const sqlFormatter = require("sql-formatter")

const { astToSqlWhere } = require("./astToSqlWhere.js")

test("astToSqlWhere: Handles single clause", () => {
  const ast = {
    clause: `table.createdAt > ?`,
    variables: ["2028-2-2"],
  }

  const sql = sqlFormatter.format(`
    table.createdAt > '2028-2-2'
  `)

  expect(astToSqlWhere(ast)).toEqual(sql)
})

test("astToSqlWhere: test", () => {
  const ast = {
    AND: [
      { clause: `table.createdAt > ?`, variables: ["2028-2-2"] },
      {
        OR: [
          { clause: `table.cost < ?`, variables: [3] },
          {
            AND: [
              { clause: `table.id in (?, ?, ?, ?)`, variables: [2, 5, 8, 9] },
              { clause: `table.cost > ?`, variables: [20] },
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
      )
    )
  )
`)

  expect(astToSqlWhere(ast)).toEqual(sql)
})

test("astToSqlWhere: test 2 complex", () => {
  const ast = {
    AND: [
      { clause: `table.createdAt > ?`, variables: ["2028-2-2"] },
      {
        OR: [
          { clause: `table.cost < ?`, variables: [3] },
          {
            AND: [
              { clause: `table.id in (?, ?, ?, ?)`, variables: [2, 5, 8, 9] },
              { clause: `table.cost > ?`, variables: [20] },
              {
                AND: [
                  { clause: `table.cost > ?`, variables: [20] },
                  { clause: `table.cost < ?`, variables: [30] },
                ],
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
          table.cost > 20
          AND table.cost < 30
        )
      )
    )
  )
`)

  expect(astToSqlWhere(ast)).toEqual(sql)
})

test("astToSqlWhere: test 3 complex", () => {
  const ast = {
    AND: [
      { clause: `table.createdAt > ?`, variables: ["2028-2-2"] },
      {
        OR: [
          { clause: `table.cost < ?`, variables: [3] },
          {
            AND: [
              { clause: `table.id in (?, ?, ?, ?)`, variables: [2, 5, 8, 9] },
              { clause: `table.cost > ?`, variables: [20] },
              {
                OR: [
                  { clause: `table.name like ?`, variables: ["A%"] },
                  { clause: `table.name regex ?`, variables: [".*A^"] },
                ],
              },
              {
                AND: [
                  { clause: `table.cost > ?`, variables: [20] },
                  { clause: `table.cost < ?`, variables: [30] },
                ],
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
            table.name like 'A%'
            OR table.name regex '.*A^'
          )
          AND (
            table.cost > 20
            AND table.cost < 30
          )
        )
      )
    )
  `)

  expect(astToSqlWhere(ast)).toEqual(sql)
})

test("astToSqlWhere: Handles relational SOME clauses (1)", () => {
  const filter = {
    users: {
      some: {
        joinDate: { gt: "2028-2-2" },
      },
    },
  }

  const ast = {
    SOME: {
      table: "someTable",
      clauses: [{ clause: `table.joinDate > ?`, variables: ["2028-2-2"] }],
    },
  }

  const sql = `
    (
      SELECT COUNT(*) from someTable
      WHERE table.joinDate > '2028-2-2
    ) > 0
  )`

  expect(astToSqlWhere(ast)).toEqual(sql)
})

test("astToSqlWhere: Handles relational SOME clauses (2)", () => {
  const filter = {
    price: { gt: 3 },
    users: {
      some: {
        joinDate: {
          gt: "2028-2-2",
          lt: "2038-2-2",
        },
      },
    },
  }

  const ast = {
    AND: [
      { clause: `table.price > ?`, variables: [3] },
      {
        SOME: {
          table: "someTable",
          clauses: [
            { clause: `table.joinDate > ?`, variables: ["2028-2-2"] },
            { clause: `table.joinDate < ?`, variables: ["2038-2-2"] },
          ],
        },
      },
    ],
  }

  const sql = `
    (
      currentTable.price > 3
      AND (
        SELECT COUNT(*) from someTable
        WHERE (
          table.joinDate > '2028-2-2
          AND table.joinDate < '2038-2-2
        )
      ) > 0
    )
  `

  expect(astToSqlWhere(ast)).toEqual(sql)
})

test("astToSqlWhere: Handles relational ALL clauses (1)", () => {
  const filter = {
    users: {
      some: {
        joinDate: { gt: "2028-2-2" },
      },
    },
  }

  const ast = {
    ALL: {
      table: "someTable",
      clauses: [{ clause: `table.joinDate > ?`, variables: ["2028-2-2"] }],
    },
  }

  const sql = `
    (
      SELECT COUNT(*) from someTable
      WHERE table.joinDate > '2028-2-2
    ) > 0
  )`

  expect(astToSqlWhere(ast)).toEqual(sql)
})

test("astToSqlWhere: Handles relational ALL clauses (2)", () => {
  const filter = {
    price: { gt: 3 },
    users: {
      some: {
        joinDate: {
          gt: "2028-2-2",
          lt: "2038-2-2",
        },
      },
    },
  }

  const ast = {
    AND: [
      { clause: `table.price > ?`, variables: [3] },
      {
        ALL: {
          table: "someTable",
          clauses: [
            { clause: `table.joinDate > ?`, variables: ["2028-2-2"] },
            { clause: `table.joinDate < ?`, variables: ["2038-2-2"] },
          ],
        },
      },
    ],
  }

  const sql = `
    (
      currentTable.price > 3
      AND (
        SELECT COUNT(*) from someTable
        WHERE (
          table.joinDate > '2028-2-2
          AND table.joinDate < '2038-2-2
        )
      ) > 0
    )
  `

  expect(astToSqlWhere(ast)).toEqual(sql)
})

test("astToSqlWhere: Handles relational NONE clauses (1)", () => {
  const filter = {
    users: {
      some: {
        joinDate: { gt: "2028-2-2" },
      },
    },
  }

  const ast = {
    NONE: {
      table: "someTable",
      clauses: [{ clause: `table.joinDate > ?`, variables: ["2028-2-2"] }],
    },
  }

  const sql = `
    (
      SELECT COUNT(*) from someTable
      WHERE table.joinDate > '2028-2-2
    ) = 0
  )`

  expect(astToSqlWhere(ast)).toEqual(sql)
})

test("astToSqlWhere: Handles relational NONE clauses (2)", () => {
  const filter = {
    price: { gt: 3 },
    users: {
      some: {
        joinDate: {
          gt: "2028-2-2",
          lt: "2038-2-2",
        },
      },
    },
  }

  const ast = {
    AND: [
      { clause: `table.price > ?`, variables: [3] },
      {
        NONE: {
          table: "someTable",
          clauses: [
            { clause: `table.joinDate > ?`, variables: ["2028-2-2"] },
            { clause: `table.joinDate < ?`, variables: ["2038-2-2"] },
          ],
        },
      },
    ],
  }

  const sql = `
    (
      currentTable.price > 3
      AND (
        SELECT COUNT(*) from currentTable
          JOIN someTable
          ON currentTable.id = someTable.foreignKey
        WHERE (
          table.joinDate > '2028-2-2
          AND table.joinDate < '2038-2-2
        )
      ) = 0
    )
  `

  expect(astToSqlWhere(ast)).toEqual(sql)
})
