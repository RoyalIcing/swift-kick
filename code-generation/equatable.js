const R = require('ramda')

const indentLines = require('./utils/indentLines')
const associatedNamesForCase = require('./utils/associatedNamesForCase')


const equatesForAssociatedNames = R.pipe(
	R.map((associatedName) => `l.${associatedName} == r.${associatedName}`),
	R.join(' && ')
)

const equatesForCase = R.converge((name, associatedNames) => (
	!R.isEmpty(associatedNames) ? ([
		`case let (.${name}(l), .${name}(r)):`,
		`\treturn ${ equatesForAssociatedNames(associatedNames) }`
	]) : ([
		`case let (.${name}, .${name}):`,
		`\treturn true`
	])
), [
	R.prop('name'),
	associatedNamesForCase
])

const equatesFuncForEnum = R.converge(
	(enumName, innerLines) => R.flatten([
		`public func == (lhs: ${enumName}, rhs: ${enumName}) -> Bool {`,
		'\tswitch (lhs, rhs) {',
		indentLines(innerLines),
		'default:',
		'\treturn false',
		'\t}',
		'}'
	]), [
		R.prop('name'), 
		R.pipe(
			R.prop('cases'),
			R.map(equatesForCase),
			R.flatten
		)
	] 
)

module.exports = {
	equatesFuncForEnum
}
