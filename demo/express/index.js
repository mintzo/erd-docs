const express = require('express')
const erdDocs = require('../../src/index.js')
const app = express()

erdDocs.attachToServer.express({
  expressApp: app,
  configurations: {
    dbType: erdDocs.dbTypes.postgresql,
    dbConnection:{
      user: 'postgres',
      host: '127.0.0.1',
      dbName: 'dbName',
      password: 'postgres',
      port: 5432
    },
    data:{
      schemaName:'schemaName'
    }
  }
})

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000)

console.log('Server Started')