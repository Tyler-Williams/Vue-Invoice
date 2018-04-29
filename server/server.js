const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')
const PORT = process.env.PORT || 3128

const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send("Welcome to Invoice App")
})

app.listen(PORT, () => {
  console.log(`App running on localhost:${PORT}`)
})