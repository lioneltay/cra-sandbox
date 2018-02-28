const R = require("ramda")
const knex = require("knex")({ client: "pg" })
const sqlFormatter = require("sql-formatter")

const { splitSingleProperty } = require("./helpers")

const traverseFormattedFilters = (filters, fn) => {
  const { key, value } = splitSingleProperty(filters)

  if (R.contains(key, ["AND", "OR"])) {
    return { [key]: value.map(filter => traverseFormattedFilters(filter, fn)) }
  }

  return fn(filters)
}

const mapFieldName = ({ tableName, schema = {}, fieldName }) => {
  const fields = schema.fields || {}

  if (!R.has(fieldName, fields)) {
    return `${tableName}.${fieldName}`
  }

  const { sqlColumn, sqlExpr } = fields[fieldName]

  return sqlColumn
    ? `${tableName}.${sqlColumn}`
    : sqlExpr
      ? `${R.type(sqlExpr) === "Function" ? sqlExpr(tableName) : sqlExpr}`
      : `${tableName}.${fieldName}`
}

const parseClause = (clause, { tableName, schema }) => {
  const { key: fieldName, value: filters } = splitSingleProperty(clause)
  const { key, value } = splitSingleProperty(filters)

  if (key === "gt") {
    return {
      clause: `${mapFieldName({ fieldName, schema, tableName })} > ?`,
      variables: [value],
    }
  }

  if (key === "gte") {
    return {
      clause: `${mapFieldName({ fieldName, schema, tableName })} >= ?`,
      variables: [value],
    }
  }

  if (key === "lt") {
    return {
      clause: `${mapFieldName({ fieldName, schema, tableName })} < ?`,
      variables: [value],
    }
  }

  if (key === "lte") {
    return {
      clause: `${mapFieldName({ fieldName, schema, tableName })} <= ?`,
      variables: [value],
    }
  }

  if (key === "regex") {
    return {
      clause: `${mapFieldName({ fieldName, schema, tableName })} REGEX ?`,
      variables: [value],
    }
  }

  if (key === "like") {
    return {
      clause: `${mapFieldName({ fieldName, schema, tableName })} LIKE ?`,
      variables: [value],
    }
  }

  if (key === "in") {
    return {
      clause: `${mapFieldName({
        fieldName,
        schema,
        tableName,
      })} in (${value.map(_ => "?").join(", ")})`,
      variables: value,
    }
  }

  throw Error("Invalid filter key")
}

const formattedFiltersToWhereAST = (
  formattedFilters,
  { tableName, schema }
) => {
  return traverseFormattedFilters(formattedFilters, filter =>
    parseClause(filter, { tableName, schema })
  )
}

module.exports = {
  formattedFiltersToWhereAST,
}
