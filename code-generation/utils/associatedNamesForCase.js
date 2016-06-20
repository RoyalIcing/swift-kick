const R = require('ramda')

const associatedNamesForCase = R.converge(R.pipe(
	R.map,
	R.pluck('name') // Falls back to the case name
), [
	R.pipe(
		R.pick(['name']),
		R.mergeWith(R.defaultTo) // Merge overriding explicit undefined
	),
	R.propOr([], 'associated')
])

module.exports = associatedNamesForCase
