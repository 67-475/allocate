/**
 * Handles project posting description from the user and
 * allocates events on their calendar appropriately
 * @param {Object} req express.js request
 * @param {Object} res express.js response
 */
function divy(req, res) {
  console.log(req.body)
  res.send('I did the thing!')
}

module.exports = divy
