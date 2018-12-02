const nomnoml = require('nomnoml')

const getSvgFromJsonSchema = async ({ jsonSchema }) => {
  let nomnomlSchema = jsonSchemaToNomnoml({ jsonSchema })
  return nomnoml.renderSvg(nomnomlSchema)
}
const jsonSchemaToNomnoml = ({ jsonSchema }) => {
  let convertedSchema = jsonSchema.map(tableSchema => creatNomnomlTable({ tableSchema }))
  let tableSchemas = convertedSchema.map(convertedTable => convertedTable.table)
  let tableConnections = convertedSchema.map(convertedTable => convertedTable.tableConnections.join('\n'))
  let nomnomlSyntax = `
  #fontSize: 10
  #spacing: 10
  #leading: 2
  
  [<frame>${jsonSchema[0][0].schema}|
    ${tableSchemas.join('\n')}
    ${tableConnections.join('\n')}
  ]`
  return nomnomlSyntax
}
const createProperties = (properties) => {
  if (properties.length == 0) { return [] }
  return properties.map(column => (`${column.column} : ${column.data_type_full}`).replace('[', '\\[').replace(']', '\\]'))
}
const creatNomnomlTable = ({ tableSchema }) => {
  let primaryKeys = createProperties(tableSchema.filter(column => column.is_primary_key && !column.is_foreign_key))
  let tableFields = createProperties(tableSchema.filter(column => !column.is_primary_key && !column.is_foreign_key))
  let foreignKeys = createProperties(tableSchema.filter(column => column.is_foreign_key))
  let tableName = tableSchema[0].table
  let table = `[${tableName} | ${primaryKeys.join(';')} ${foreignKeys.length > 0 ? '|' + foreignKeys : ''} | ${tableFields.join(';')} ]`
  let tableConnections = tableSchema.filter(column => column.is_foreign_key).map(filed => `[${filed.table}] --> [${filed.foreign_key_table}]`)
  tableConnections = [
    tableConnections,
    tableSchema.filter(column => column.customConnection).map(filed => `[${filed.customConnection.table}] -- [${tableName}]`)
  ]
  return { table, tableConnections }
}
module.exports = { getSvgFromJsonSchema, jsonSchemaToNomnoml }