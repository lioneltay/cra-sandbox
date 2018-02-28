const R = require("ramda")
const sqlFormatter = require("sql-formatter")
const knex = require("knex")({ client: "pg" })

// Turn filter AST into where string
const astToSqlWhere = ast => {
  const astToSql_ = (ast, currentSql) => {
    if (ast.AND) {
      const subSql = ast.AND.map(subAst => astToSql_(subAst, currentSql)).join(
        " AND "
      )
      const sql = currentSql ? [currentSql, subSql].join(" AND ") : subSql
      return `(${sql})`
    }

    if (ast.OR) {
      const subSql = ast.OR.map(subAst => astToSql_(subAst, currentSql)).join(
        " OR "
      )
      const sql = currentSql ? [currentSql, subSql].join(" OR ") : subSql
      return `(${sql})`
    }

    return knex.raw(ast.clause, ast.variables).toString()
  }

  return sqlFormatter.format(astToSql_(ast, ""))
}

module.exports = {
  astToSqlWhere,
}
