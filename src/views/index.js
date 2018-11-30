const nomnoml = require('./nomnoml/nomnoml.js')

const views = {
  nomnoml: 'nomnoml'
}

const svgRenderers = [views.nomnoml]
const getSvgFromSchema = async ({ schema, view }) => {
  if (!svgRenderers.includes(view)) { throw new Error(`Please pick one of the fallowing renderers: ${svgRenderers}`) }
  if (view == views.nomnoml) {
    return nomnoml.getSvgFromJsonSchema({ jsonSchema: schema })
  }
}
module.exports = {
  views, svgRenderers,
  getSvgFromSchema
}