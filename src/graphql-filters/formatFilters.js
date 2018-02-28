const R = require("ramda")
const {
  objToArray,
  splitSingleProperty,
  onlyKey,
  onlyValue,
  singleKey,
} = require("./helpers")

const sqlFilterKey = key =>
  R.contains(key, ["gt", "lt", "in", "regex", "like", "eq"])
const relationalFilterKey = key => R.contains(key, ["some", "all", "none"])
const combinationKey = key => R.contains(key, ["AND", "OR"])

const formatOR = orFilters => {
  const res = orFilters.OR.map(formatFilters).reduce((acc, v) => {
    if (R.has("AND", v) && singleKey(v.AND)) {
      return acc.concat(v.AND)
    }

    if (R.has("OR", v)) {
      return acc.concat(v.OR)
    }

    return acc.concat(v)
  }, [])

  return { OR: res }
}

const formatAND = andFilters => {
  const arr = andFilters.AND.map(formatFilters).reduce((acc, v) => {
    if (R.has("AND", v)) {
      return acc.concat(v.AND)
    }

    if (R.has("OR", v) && singleKey(v.OR)) {
      return acc.concat(v.OR)
    }

    return acc.concat(v)
  }, [])

  return { AND: arr }
}

const formatFilters = filters => {
  // { property: { ... }, proerty2: { ... }, ... }
  if (!singleKey(filters)) {
    const res = formatFilters({
      AND: objToArray(filters),
    })
    return res
  }

  // { AND/or: [{}]}
  if (
    singleKey(filters) &&
    combinationKey(onlyKey(filters)) &&
    onlyValue(filters).length === 1
  ) {
    return formatFilters(onlyValue(filters)[0])
  }

  // { property: { filterType: value } }
  if (
    singleKey(onlyValue(filters)) &&
    sqlFilterKey(onlyKey(onlyValue(filters)))
  ) {
    return filters
  }

  // { property: { relationalType: value } }
  if (
    singleKey(onlyValue(filters)) &&
    relationalFilterKey(onlyKey(onlyValue(filters)))
  ) {
    // console.log("relationalKey", filters)
    return filters
  }

  // { property; { ... } }
  if (!combinationKey(onlyKey(filters)) && !singleKey(onlyValue(filters))) {
    return formatFilters({
      AND: objToArray(onlyValue(filters)).map(clause => ({
        [onlyKey(filters)]: clause,
      })),
    })
  }

  // { AND: [...] }
  if (onlyKey(filters) === "AND") {
    return formatAND(filters)
  }

  // { OR: [...] }
  if (onlyKey(filters) === "OR") {
    return formatOR(filters)
  }

  console.log("@@shit@@", JSON.stringify(filters, null, 2))
}

const filters = {
  users: {
    some: {
      lastName: { regex: "^B.*" },
      firstName: { like: "A%", regex: "^B.*" },
    },
  },
}

console.log(JSON.stringify(formatFilters(filters), null, 2))

module.exports = {
  formatFilters,
}

// // if { property: { filterType: value, filterType2: value } } just return it
// if (!combinationKey(onlyKey(filters)) && !singleKey(onlyValue(filters))) {
//   const andArray = objToArray(onlyValue(filters)).map(v => ({
//     [onlyKey(filters)]: v,
//   }))
//   console.log("asdkjf", andArray)
//   console.log(JSON.stringify(filters, null, 2))

//   return {
//     AND: formatAND(andArray),
//   }
// }

// if (
//   !R.has("AND", filters) &&
//   !R.has("OR", filters) &&
//   R.keys(filters).length === 1 &&
//   R.keys(splitSingleProperty(filters).value).length === 1
// ) {
//   const { key, value } = splitSingleProperty(filters)
//   if (
//     R.keys(value).length === 1 &&
//     !R.contains(key, ["some", "all", "none"])
//   ) {
//     return filters
//   }
// }

// return {
//   AND: objToArray(filters).reduce((andItems, itemFilters) => {
//     const { key: fieldName, value: fieldFilters } = splitSingleProperty(
//       itemFilters
//     )

//     if (fieldName === "OR") {
//       return andItems.concat(formatOR(fieldFilters))
//     }

//     if (fieldName === "AND") {
//       return andItems.concat(formatAND(fieldFilters))
//     }

//     const parseFilters = itemFilters => {
//       const fieldName = R.head(R.keys(itemFilters))
//       const fieldFilters = itemFilters[fieldName]

//       return objToArray(fieldFilters).map(singleFilter => {
//         const filterKey = onlyKey(singleFilter)
//         const filterValue = onlyValue(singleFilter)
//         // The filter is a relational filter
//         if (R.contains(filterKey, ["some", "none", "all"])) {
//           return {
//             [fieldName]: {
//               [filterKey]: format(filterValue),
//             },
//           }
//         }

//         if (R.contains(filterKey, ["OR", "AND"])) {
//           return {
//             [fieldName]: {
//               [filterKey]: filterValue.map(format),
//             },
//           }
//         }

//         return {
//           [fieldName]: singleFilter,
//         }
//       })
//     }

//     return andItems.concat(parseFilters(itemFilters))
//   }, []),
//
