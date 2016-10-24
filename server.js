var express = require('express')
var app = express()

// cookies
var cookieParser = require('cookie-parser')
app.use(cookieParser())

// set up logs and view engine
app.use(require('morgan')('dev'))
app.set('view engine', 'ejs') // set up ejs for templating

// routes
var auth = require('./auth/routes.js').init(app)

app.use((req, res) => { res.redirect('/') })

const port = process.env.PORT || 8080
app.set('port', port);
var http = require('http').Server(app)

// Start Application
http.listen(port, () => {
    console.log("Server started on port " + port)
})
