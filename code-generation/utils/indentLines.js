const R = require('ramda')

const indentLine = (line) => `\t${line}`
const indentLines = R.map(indentLine)

module.exports = indentLines
