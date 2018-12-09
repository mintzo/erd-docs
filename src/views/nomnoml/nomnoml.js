const nomnoml = require('nomnoml')

const getSvgFromJsonSchema = async ({ jsonSchema }) => {
  const nomnomlSchema = jsonSchemaToNomnoml({ jsonSchema })
  return nomnoml.renderSvg(nomnomlSchema)
}
const jsonSchemaToNomnoml = ({ jsonSchema }) => {
  const convertedSchema = jsonSchema.tables.map(tableSchema => creatNomnomlTable({ tableSchema }))
  const tableSchemas = convertedSchema.map(convertedTable => convertedTable.table)
  const tableConnections = convertedSchema.map(convertedTable => convertedTable.tableConnections.join('\n'))
  const typesTables = createNomnomlTypes({ types: jsonSchema.types })
  const nomnomlSyntax = `
  #fontSize: 10
  #spacing: 10
  #leading: 2
  
  [<frame>${jsonSchema.name}|
    ${tableSchemas.join('\n')}
    ${tableConnections.join('\n')}

  ]
  ${typesTables}
  `
  return nomnomlSyntax
}
const createProperties = (properties) => {
  if (properties.length == 0) { return [] }
  return properties.map(column => (`${column.column} : ${column.data_type_full}`).replace('[', '\\[').replace(']', '\\]'))
}
const creatNomnomlTable = ({ tableSchema }) => {
  const primaryKeys = createProperties(tableSchema.filter(column => column.is_primary_key && !column.is_foreign_key))
  const tableFields = createProperties(tableSchema.filter(column => !column.is_primary_key && !column.is_foreign_key))
  const foreignKeys = createProperties(tableSchema.filter(column => column.is_foreign_key))
  const tableName = tableSchema[0].table
  const table = `[${tableName} | ${primaryKeys.join(';')} ${foreignKeys.length > 0 ? '|' + foreignKeys : ''} | ${tableFields.join(';')} ]`
  let tableConnections = tableSchema.filter(column => column.is_foreign_key).map(filed => `[${filed.table}] --> [${filed.foreign_key_table}]`)
  tableConnections = [
    tableConnections,
    tableSchema.filter(column => column.customConnection).map(filed => `[${filed.customConnection.table}] -- [${tableName}]`)
  ]
  return { table, tableConnections }
}

const createNomnomlTypes = ({ types }) => {
  if (types.length == 0) { return '' }
  const typeTables = types.map(type => createNomnomlType({ type })).join('\n')
  return `[<note> Types |
   ${typeTables} 
  ]`
}

const createNomnomlType = ({ type }) => `[${type.name} | ${type.values.join(';')}]`
module.exports = { getSvgFromJsonSchema, jsonSchemaToNomnoml }