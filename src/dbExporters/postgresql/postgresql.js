const { Client } = require('pg')

const dbQueries = require('./dbQueries')

const getJsonSchemas = async ({ configurations }) => {
  if (!configurations.dbConnection) { throw new Error('Missing dbConnections In config') }

  try {
    const pgConnectionSettings = {
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
    const schemaName = configurations.data.schemaName
    let tableNames = await getTableNames({ client, schemaName })
    if (configurations.data.ignoreTables) {
      tableNames = tableNames.filter(tableName => !configurations.data.ignoreTables.includes(tableName))
    }
    const returnSchemas = []
    for (let tableIndex = 0; tableIndex < tableNames.length; tableIndex++) {
      const tableName = tableNames[tableIndex];
      returnSchemas.push(await getTableSchema({ client, tableName, schemaName, configurations }))
    }
    const jsonSchema = {
      tables: returnSchemas, types: await setEnumTypes({ client, tableSchemas: returnSchemas }), name: configurations.data.schemaName
    }
    await client.end()
    return jsonSchema
  } catch (error) {
    console.error('DB Connection Problem:')
    console.error(error)
  }
}

const setEnumTypes = async ({ client, tableSchemas }) => {
  const enumResponse = (await client.query(dbQueries.getEnumTypesQuery())).rows
  const DBEnums = enumResponse.reduce((savedEnums, currentEnum) => {
    if (!savedEnums) {
      savedEnums = [currentEnum.enumtype]
    } else if (!savedEnums.includes(currentEnum.enumtype)) {
        savedEnums.push(currentEnum.enumtype)
      }
    return savedEnums
  }, [])
  let usedEnumsInSchema = []
  tableSchemas.forEach(tableSchema => {
    tableSchema.forEach(filed => {
      if (DBEnums.includes(filed.data_type_name) && !usedEnumsInSchema.includes(filed.data_type_name)) {
        usedEnumsInSchema.push(filed.data_type_name)
      }
    })
  })
  usedEnumsInSchema = usedEnumsInSchema.map(enumName => {
    const enumObject = {
      name: enumName,
      values: enumResponse.filter(DBEnum => DBEnum.enumtype == enumName).map(DBEnum => DBEnum.enumlabel)
    }
    return enumObject
  })
  return usedEnumsInSchema
}

const getTableSchema = async ({ client, tableName, schemaName, configurations }) => {
  const schemaResponse = await client.query(dbQueries.getTableSchemaQuery({ tableName, schemaName }))
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
  configurations.data.customConnections.forEach(customConnection => {
    if (row.column == customConnection.connectToOtherTablesContaining && customConnection.table != tableName) {
      row.customConnection = { ...customConnection }
    }
  })
}

const getTableNames = async ({ client, schemaName }) => {
  const tablesResponse = await client.query(dbQueries.getTableNamesQuery(schemaName))
  return tablesResponse.rows.map(row => row.table_name)
}


module.exports = {
  getJsonSchemas
}