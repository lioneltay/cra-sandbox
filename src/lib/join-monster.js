const joinMonster = require("join-monster").default
const R = require("ramda")
const knex = require.main.require("../common/functions/knex")

const debug = true

const defaultDBCall = sql => knex.raw(sql).then(R.prop("rows"))

const jm = (resolveInfo, context = {}, dbCall = defaultDBCall, options) =>
  joinMonster(
    resolveInfo,
    R.merge({ knex }, context),
    sql => {
      const result = dbCall(sql)

      if (debug) {
        console.log("\n", sql)
        result.then(rows => {
          console.log(`Join-Monster Query rows: ${rows.length}`)
          // console.log(rows)
        })
      }

      return result
    },
    R.merge({ dialect: "pg" }, options)
  )

jm.infoOnly = (root, args, context, info) => jm(info)

module.exports = jm
