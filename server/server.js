const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcrypt')
const mulitpart = require('connect-multiparty')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const saltRounds = 10
const PORT = process.env.PORT || 3128
const multipartMiddleware = mulitpart()
const databaseLocation = './database/InvoicingApp.db'

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cors())

//  PROTECT ROUTES
app.use(function (req, res, next) {
  const token = req.body.token || req.query.token || req.headers['x-access-token']

  //  DECODE
  if (token) {
    jwt.verify(token, app.get('appSecret'), (err, decoded) => {
      if (err) {
        return res.json({
          status: false,
          message: 'Failed to auth token'
        })
      } else {
        req.decoded = decoded
        next()
      }
    })
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided'
    })
  }
})

app.set('appSecret', 'secretforinvoicingapp')

function isEmpty(str) {
  return !str || 0 === str.length;
}

app.get('/', (req, res) => {
  res.send("Welcome to Invoice App")
})

app.listen(PORT, () => {
  console.log(`App running on localhost:${PORT}`)
})

app.post('/register', (req, res) => {
  console.log('Registering: ', req.body)
  if (isEmpty(req.body.name) || isEmpty(req.body.email) || isEmpty(req.body.company_name) || isEmpty(req.body.password)) {
    return res.json({
      status : false,
      message : 'All fields are required'
    })
  }

  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    let db = new sqlite3.Database(databaseLocation)
    let sql = `INSERT INTO users(name,email,company_name,password)
      VALUES(
        '${req.body.name}',
        '${req.body.email}',
        '${req.body.company_name}',
        '${hash}')`

    db.run(sql, function (err) {
      if (err) {
        throw err
      } else {
        let userId = this.lastID
        let query = `SELECT * FROM users WHERE id='${userId}'`
        db.all(query, [], (err, rows) => {
          if (err) {
            throw err
          }
          let user = rows[0]
          delete user.password

          const payload = { user: user }
          let token = jwt.sign(payload, app.get('appSecret'), {
            expiresIn: '24h'
          })

          return res.json({
            status: true,
            user: user,
            token: token
          })
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
      const payload = { user: user}
      let token = jwt.sign(payload, app.get('appSecret'), {
        expiresIn: '24h'
      })
      return res.json({
        status: true,
        user: user,
        token: token
      })
    }
    return res.json({
      status: false,
      message: 'Incorrect password'
    })
  })
})

app.post('/invoice', multipartMiddleware, (req, res) => {
  if (isEmpty(req.body.name)) {
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
      db.run(sql, function(err) {
        if (err) {
          console.log('Error inserting invoice into invoices table')
          throw err
        }

        let invoice_id = this.lastID

        for (let i = 0; i < req.body.txn_names.length; i++) {
          let query = `INSERT INTO transactions(name,price,invoice_id)
            VALUES(
              '${req.body.txn_names[i]}',
              '${req.body.txn_prices[i]}',
              '${invoice_id}'
            )`
//          console.log(`Query: ${query}`)
          db.run(query, (err) => {
            if (err) {
              console.log('Error inserting transaction into transactions table')
          throw err
            }
          })
        }
        return res.json({
          status: true,
          message: "Invoice created"
        })
      })
    })
})

app.get('/invoice/user/:user_id', multipartMiddleware, (req, res) => {
  let db = new sqlite3.Database(databaseLocation)
  let sql = `SELECT * FROM invoices
    WHERE user_id='${req.params.user_id}'`


  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err
    }
    return res.json({
      status: true,
      invoices: rows
    })
  })
})

app.get('/invoice/user/:user_id/:invoice_id', multipartMiddleware, (req, res) => {
  const db = new sqlite3.Database(databaseLocation)
  const sql = `SELECT * FROM invoices
    WHERE user_id='${req.params.user_id}' AND id='${req.params.invoice_id}'`

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err
    }
    const invoice = rows[0]
    const fetchInvoiceDataSql = `SELECT * FROM transactions WHERE invoice_id=${req.params.invoice_id}`

    db.all(fetchInvoiceDataSql, [], (err, rows) => {
      return res.json({
        status: true,
        invoice: invoice,
        transactions: rows
      })
    })
  })
})
