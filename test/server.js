/* eslint import/no-unresolved:0, no-console:0 */
var assert = require('chai').assert;

describe('server.js', () => {
  it('should start outside of deployment environment', () => {
    const server = require('../server')

    // we really don't need to test anything, as the server is running
    // once you require() it, we just need an assertion here
    // so that chai shows a successful test
    assert.isTrue(server.port === (process.env.PORT || 8080))
  })
})
