const erdDocs = require('./erdDocs.js')
const { dbTypes } = require('./dbExporters/index')
const defaultConfigurations = {
  serveUrl: '/docUrl',
  schemaRoutes: '/erd'
}
function setConfigurations ({ configurations }) {
  return { ...defaultConfigurations, ...configurations }
}
const attachToExpress = ({ expressApp, configurations }) => {
  configurations = setConfigurations({ configurations })

  expressApp.get(configurations.serveUrl, (req, res) => {
    res.send('WORKING !')
  })

  expressApp.get(`${configurations.schemaRoutes}/json`, (req, res) => {
    (async () => {
      res.json(await erdDocs.getSchemas.json({ configurations }))
    })()
  })

}


module.exports = {
  dbTypes,
  attachToServer: {
    express: attachToExpress
  }
}

