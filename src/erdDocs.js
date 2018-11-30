const { getJsonSchema } = require('./dbExporters/index.js')
const { getSvgFromSchema } = require('./views/index.js')

const generateDocs = async ({ configurations }) => {

  return ``
}


const getSchemas = { json: getJsonSchema }

module.exports = { generateDocs, getSchemas, getSvgFromSchema }