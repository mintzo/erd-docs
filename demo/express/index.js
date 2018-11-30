const express = require('express')
const erdDocs = require('../../index.js')
const app = express()

erdDocs.attachToServer.express({ expressApp: app, configurations: {} })

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000)