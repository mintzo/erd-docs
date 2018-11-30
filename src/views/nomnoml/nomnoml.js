const nomnoml = require('nomnoml')

const getSvgFromJsonSchema = async ({ jsonSchema }) => {

  return nomnoml.renderSvg('[nomnoml] is -> [awesome]')
}

module.exports = { getSvgFromJsonSchema }