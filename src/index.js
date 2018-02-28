import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import registerServiceWorker from "./registerServiceWorker"

// import "graphql-filters/formattedFiltersToWhereAST"
import "graphql-filters/formatFilters"
// import schema from "graphql-schema"

// console.dir(schema)

ReactDOM.render(<App />, document.getElementById("root"))
registerServiceWorker()
