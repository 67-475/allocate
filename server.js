var app = require('express')();
app.use(require('morgan')('dev'));

app.get('/login', (req, res) => {
  res.send('landing page')
  // generate page with authorization link
})

app.get('/auth', (req, res) => {
  // use authorization code to oauth2Client.getToken and
  // save to encrypted session
  res.send("Your authorization code is " req.query);
})

app.listen(8080)
