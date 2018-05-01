const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const mulitpart = require('connect-multiparty')

const saltRounds = 10
const PORT = process.env.PORT || 3128
const multipartMiddleware = mulitpart()
const databaseLocation = './database/InvoicingApp.db'

const app = express()
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send("Welcome to Invoice App")
})

app.listen(PORT, () => {
  console.log(`App running on localhost:${PORT}`)
})

app.post('/register', (req, res) => {
  if (!(req.body.name) || !(req.body.email) || !(req.body.company_name) || !(req.body.password)) {
    return res.json({
      status : false,
      message : 'All fields are required'
    })
  }

  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    let db = new sqlite3.Database(databaseLocation)
    let sql = `INSERT INTO users(name,email,company_name,password)
      VALUES(
        '${req.body.name}',
        '${req.body.email}',
        '${req.body.company_name}',
        '${hash}')`

    db.run(sql, (err) => {
      if (err) {
        throw err
      } else {
        return res.json({
          status: true,
          message: 'User Created'
        })
      }
    })
    db.close()
  })
})

app.post('/login', (req, res) => {
  let db = new sqlite3.Database(databaseLocation)
  let sql = `SELECT * from users where email='${req.body.email}'`
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err
    }
    db.close()
    if (rows.length == 0) {
      return res.json({
        status: false,
        message: 'Wrong email'
      })
    }
    let user = rows[0]
    let authenticated = bcrypt.compareSync(req.body.password, user.password)
    delete user.password
    if (authenticated) {
      return res.json({
        status: true,
        user: user
      })
    }
    return res.json({
      status: false,
      message: 'Incorrect password'
    })
  })
})

app.post('/invoice', multipartMiddleware, (req, res) => {
  if (req.body.name == null) {
    return res.json({
      status: false,
      message: 'Invoice needs a name'
    })
  }

  let db = new sqlite3.Database(databaseLocation)
  let sql = `INSERT INTO invoices(name,user_id,paid)
    VALUES(
      '${req.body.name}',
      '${req.body.user_id}',
      0
    )`

    db.serialize(() => {
      db.run(sql, (err) => {
        if (err) {
          throw err
        }
        let invoice_id = this.lastID
        for (let i = 0; i< req.body.txn_names.length; i++) {
          let query = `INSERT INTO transactions(name,price,invoice_id)
            VALUES(
              '${req.body.txn_names[i]}'
              '${req.body.txn_prices[i]}'
              '${invoice_id}'
            )`
          db.run(query)
        }
        return res.json({
          status: true,
          message: "Invoice created"
        })
      })
    })
})
