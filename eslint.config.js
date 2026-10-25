const eslint = require('eslint-config-next')

module.exports = {
  ...eslint,
  rules: {
    // Add custom rules here
    'react/react-in-jsx-scope': 'off',
    'react/no-unescaped-entities': 'off',
  },
}