const R = require("ramda")
const knex = require("knex")({ client: "pg" })
const sqlFormatter = require("sql-formatter")

const { formatFilters } = require("./formatFilters")
const { formattedFiltersToWhereAST } = require("./formattedFiltersToWhereAST")
const { astToSqlWhere } = require("./astToSqlWhere")

const generateWhereClause = (filters, { schema, tableName }) => {
  // Format the filters to use a more verbose syntax
  // No domain logic here
  const formattedFilters = formatFilters(filters)

  // Turn the filters into an sql where AST
  // ALL the domain logic is here
  // The sql stuff happens here
  const whereAST = formattedFiltersToWhereAST(formattedFilters, {
    tableName,
    schema,
  })

  // Turn the AST into a where clause string
  // No domain logic here
  const ast = astToSqlWhere(whereAST)

  return ast
}

module.exports = {
  generateWhereClause,
}
