var options = {
  'extends': 'airbnb',
  'rules': {
    'quotes': ['off', 'single'],
    'require-jsdoc': ['error']
  },
  "plugins": [
      "react",
      "jsx-a11y",
      "import"
  ]
}

const rules = [ 'semi',
  'import/newline-after-import',
  'space-before-function-paren',
  'comma-dangle',
  'prefer-template',
  'camelcase',
  'object-shorthand',
  'no-var',
  'vars-on-top',
  'no-plusplus',
  'no-mixed-operators'
 ]

rules.forEach((rule) => {
    options.rules[rule] = ['off']
})

module.exports = options
