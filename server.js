var app = require('express')();

app.use(require('morgan')('dev'));
app.set('view engine', 'ejs'); // set up ejs for templating

var auth = require('./auth.js');
auth.init(app);

app.listen(8080)
