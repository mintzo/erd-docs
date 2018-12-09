const { getJsonSchema } = require('./dbExporters/index.js')
const { getSvgFromSchema } = require('./views/index.js')

const generateDocs = async ({ configurations }) => configurations


const getSchemas = { json: getJsonSchema }

module.exports = { generateDocs, getSchemas, getSvgFromSchema }