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
    if (configurations.data.ignoreTables) {
      tableNames = tableNames.filter(tableName => !configurations.data.ignoreTables.includes(tableName))
    }
    let returnSchemas = []
    for (let tableIndex = 0; tableIndex < tableNames.length; tableIndex++) {
      let tableName = tableNames[tableIndex];
      returnSchemas.push(await getTableSchema({ client, tableName, schemaName, configurations }))
    }
    await client.end()
    return returnSchemas
  } catch (error) {
    console.error('DB Connection Problem:')
    console.error(error)
  }
}

const getTableSchema = async ({ client, tableName, schemaName, configurations }) => {
  let schemaResponse = await client.query(dbQueries.getTableSchemaQuery({ tableName, schemaName }))
  return schemaResponse.rows.map(row => {
    row.is_foreign_key = row.is_foreign_key == 't'
    row.is_primary_key = row.is_primary_key == 't'
    row.is_unique_key = row.is_unique_key == 't'
    if (configurations.data.customConnections) {
      addCustomConnections({ row, tableName, configurations })
    }
    return row
  })
}

const addCustomConnections = ({ row, tableName, configurations }) => {
  configurations.data.customConnections.map(customConnection=>{
    if(row.column == customConnection.connectToOtherTablesContaining && customConnection.table != tableName){
      row.customConnection = {...customConnection}
    }
  })
}

const getTableNames = async ({ client, schemaName }) => {
  let tablesResponse = await client.query(dbQueries.getTableNamesQuery(schemaName))
  return tablesResponse.rows.map(row => row.table_name)
}


module.exports = {
  getJsonSchemas
}