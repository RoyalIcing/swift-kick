const R = require('ramda')

const commaLine = (line) => `${line},`
const commaLines = R.converge(
	R.concat, [
		R.pipe(
			R.init,
			R.map(commaLine)
		),
		R.last
	])

module.exports = commaLines