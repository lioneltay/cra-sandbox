const R = require("ramda")

const splitSingleProperty = object => {
  const key = R.head(R.keys(object))
  const value = object[key]
  return { key, value }
}

const singleKey = object => R.keys(object).length === 1

const onlyKey = object => {
  if (R.keys(object).length !== 1) {
    throw Error("onlyKey used on object with keys.length !== 1")
  }

  return splitSingleProperty(object).key
}

const onlyValue = object => {
  if (R.values(object).length !== 1) {
    throw Error("onlyValue used on object with values.length !== 1")
  }

  return splitSingleProperty(object).value
}

const mapOperator = operator => {
  switch (operator) {
    case "gt": {
      return ">"
    }
    case "lt": {
      return "<"
    }
  }

  throw Error("invalid operator")
}

const objToArray = R.pipe(R.toPairs, R.map(([k, v]) => ({ [k]: v })))

module.exports = {
  splitSingleProperty,
  onlyKey,
  onlyValue,
  singleKey,
  mapOperator,
  objToArray,
}
