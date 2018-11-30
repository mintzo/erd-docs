const postgresql = require('./postgresql/postgresql')
const dbTypes = {
  postgresql: 'postgresql'
}
const getJsonSchema = async ({ configurations }) => {
  if (!configurations.dbType) { throw new Error('Missing dbType in Configuration') }
  if (configurations.dbType === dbTypes.postgresql) {
    return postgresql.getJsonSchemas({ configurations })
  }
}
module.exports = {
  dbTypes,
  getJsonSchema,
  postgresql,
}