/**
 * Conveniently access GraphQLTypes.
 * Normalise the way types are used. They are either scalar types like String/Boolean... or called as a function, no need for the 'new' keyword.
 * Easily create and store user defined types.
 * Automatic type checking to prevent silly errors.
 */
const {
  GraphQLBoolean,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLEnumType,
} = require("graphql")

const types = {
  Boolean: GraphQLBoolean,
  String: GraphQLString,
  Int: GraphQLInt,
  ID: GraphQLID,
  List: GraphQLList,
  NonNull: GraphQLNonNull,
  Enum: settings => new GraphQLEnumType(settings),
  Object: settings => new GraphQLObjectType(settings),
  Schema: settings => new GraphQLSchema(settings),
}

const GQLTypes = name => {
  if (!types[name]) {
    throw new Error(
      `[GQLType()] Type with name '${name}' does not exist. If the name is correct you may have mispelled the name in DefineType or have forgotten to run the definition file by ensuring you import it into a file that will be executed at runtime.`
    )
  }

  return types[name]
}

GQLTypes.DefineType = (name, type) => {
  if (types[name]) {
    throw new Error(`[GQL.DefineType()] Type '${name}' is already defined`)
  }

  types[name] = type
}

module.exports = GQLTypes
