const { Client } = require('pg')

const dbQueries = require('./dbQueries')

const getJsonSchemas = async ({ configurations }) => {
  if (!configurations.dbConnection) { throw new Error('Missing dbConnections In config') }

  try {
    let pgConnectionSettings = {
      user: configurations.dbConnection.user,
      host: configurations.dbConnection.host,
      database: configurations.dbConnection.dbName,
      password: configurations.dbConnection.password,
      port: configurations.dbConnection.port
    }

    const client = new Client(pgConnectionSettings)
    await client.connect()

    if (!configurations.data) { throw new Error('Missing data in config') }
    if (!configurations.data.schemaName) { throw new Error('Missing data.schemaName in config') }
    let schemaName = configurations.data.schemaName
    let tableNames = await getTableNames({ client, schemaName })
    let returnSchemas = []
    for (let tableIndex = 0; tableIndex < tableNames.length; tableIndex++) {
      let tableName = tableNames[tableIndex];
      returnSchemas.push(await getTableSchema({ client, tableName, schemaName }))
    }
    await client.end()
    return returnSchemas
  } catch (error) {
    console.error('DB Connection Problem:')
    console.error(error)
  }
}

const getTableSchema = async ({ client, tableName, schemaName }) => {
  let schemaResponse = await client.query(dbQueries.getTableSchemaQuery({ tableName, schemaName }))
  return schemaResponse.rows
}


const getTableNames = async ({ client, schemaName }) => {
  let tablesResponse = await client.query(dbQueries.getTableNamesQuery(schemaName))
  return tablesResponse.rows.map(row => row.table_name)
}


module.exports = {
  getJsonSchemas
}