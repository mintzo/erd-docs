const getTableSchemaQuery = ({ schemaName, tableName }) => `
  SELECT
  n.nspname as schema,
  c.relname as table,
  f.attname as column,  
  f.attnum as column_id,  
  f.attnotnull as not_null,
  f.attislocal not_inherited,
  f.attinhcount inheritance_count,
  pg_catalog.format_type(f.atttypid,f.atttypmod) AS data_type_full,
  t.typname AS data_type_name,
  CASE  
      WHEN f.atttypmod >= 0 AND t.typname <> 'numeric'THEN (f.atttypmod - 4) --first 4 bytes are for storing actual length of data
  END AS data_type_length, 
  CASE  
      WHEN t.typname = 'numeric' THEN (((f.atttypmod - 4) >> 16) & 65535)
  END AS numeric_precision,   
  CASE  
      WHEN t.typname = 'numeric' THEN ((f.atttypmod - 4)& 65535 )
  END AS numeric_scale,       
  CASE  
      WHEN p.contype = 'p' THEN 't'  
      ELSE 'f'  
  END AS is_primary_key,  
  CASE
      WHEN p.contype = 'p' THEN p.conname
  END AS primary_key_name,
  CASE  
      WHEN p.contype = 'u' THEN 't'  
      ELSE 'f'
  END AS is_unique_key,
  CASE
      WHEN p.contype = 'u' THEN p.conname
  END AS unique_key_name,
  CASE
      WHEN p.contype = 'f' THEN 't'
      ELSE 'f'
  END AS is_foreign_key,
  CASE
      WHEN p.contype = 'f' THEN p.conname
  END AS foreignkey_name,
  CASE
      WHEN p.contype = 'f' THEN p.confkey
  END AS foreign_key_columnid,
  CASE
      WHEN p.contype = 'f' THEN g.relname
  END AS foreign_key_table,
  CASE
      WHEN p.contype = 'f' THEN p.conkey
  END AS foreign_key_local_column_id,
  CASE
      WHEN f.atthasdef = 't' THEN d.adsrc
  END AS default_value
FROM pg_attribute f  
  JOIN pg_class c ON c.oid = f.attrelid  
  JOIN pg_type t ON t.oid = f.atttypid  
  LEFT JOIN pg_attrdef d ON d.adrelid = c.oid AND d.adnum = f.attnum  
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace  
  LEFT JOIN pg_constraint p ON p.conrelid = c.oid AND f.attnum = ANY (p.conkey)  
  LEFT JOIN pg_class AS g ON p.confrelid = g.oid  
WHERE c.relkind = 'r'::char  
  AND f.attisdropped = false
  AND n.nspname = '${schemaName}'  -- Replace with Schema name  
  AND c.relname = '${tableName}'  -- Replace with table name  
  AND f.attnum > 0 
ORDER BY f.attnum
;`
const getTableNamesQuery = (schemaName) => `
  SELECT table_name
  FROM INFORMATION_SCHEMA.TABLES 
  WHERE table_schema = '${schemaName}';`
const getEnumTypesQuery = () => `
  SELECT pg_type.typname AS enumtype, 
     pg_enum.enumlabel AS enumlabel
  FROM pg_type 
  JOIN pg_enum 
     ON pg_enum.enumtypid = pg_type.oid;`

module.exports = {
  getTableNamesQuery, getTableSchemaQuery, getEnumTypesQuery
}