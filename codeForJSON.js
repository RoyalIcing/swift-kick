const R = require('ramda')

const indentLines = require('./indentLines')

const tapLog = (id) => R.tap(input => console.log(id, input))

const decodeMethodForType = R.cond([
	[R.equals('NSUUID'), R.always('decodeUUID')],
	[R.test(/\?$/), R.always('decodeOptional')],
	[R.T, R.always('decode')]
])

const decodeForAssociated = (associated) => (
	`${
		associated.name
	}: source.${
		decodeMethodForType(associated.type)
	}("${
		associated.name
	}")`
)

const commaLine = (line) => `${line},`
const commaLines = R.converge(
	R.concat, [
		R.pipe(
			R.init,
			R.map(commaLine)
		),
		R.last
	])

const initForCase = R.converge((name, hasAssociated, decodes) => R.flatten([
	`case .${name}:`
].concat(hasAssociated ? [
	`\tself = try .${name}(`,
	indentLines(indentLines(commaLines(decodes))),
	`\t)`
] : [
	`\tself = .${name}`
])
	
), [
	R.prop('name'),
	R.pipe(
		R.prop('associated'),
		R.complement(R.isEmpty)
	),
	R.pipe(
		R.prop('associated'),
		R.map(decodeForAssociated)
	),
])

const initMethodForCases = R.pipe(
	R.map(initForCase),
	R.flatten,
	(innerLines) => R.flatten([
		'public init(source: JSONObjectDecoder) throws {',
		indentLines([
			'let type: Kind = try source.decode("type")',
			'switch type {',
		]),
		indentLines(innerLines),
		indentLines([
			'}'
		]),
		'}'
	])
)


const assignForAssociated = (associated) => (
	`"${ associated.name }": ${ associated.name }.toJSON()`
)

const toJSONForCase = R.converge((name, associatedNames, assigns) => R.flatten([
	!!associatedNames ? (
		`case let .${name}(${ associatedNames.join(', ') }):`
	) : (
		`case let .${name}:`
	),
	`\treturn .ObjectValue([`,
	indentLines(indentLines(commaLines(
		[
			`"type": Kind.${name}.toJSON()`
		].concat(assigns)
	))),
	`\t])`
]), [
	R.prop('name'),
	R.pipe(
		R.prop('associated'),
		R.pluck('name')
	),
	R.pipe(
		R.propOr([], 'associated'),
		R.map(assignForAssociated)
	)
])

const toJSONMethodForCases = R.pipe(
	R.map(toJSONForCase),
	R.flatten,
	(innerLines) => R.flatten([
		'public func toJSON() -> JSON {',
		'\tswitch self {',
		indentLines(innerLines),
		'\t}',
		'}'
	])
)

const codeForJSON = R.pipe(
	R.converge(
		(name, initLines, toJSONLines) => R.flatten([
			`extension ${name} : JSONObjectRepresentable {`,
			indentLines(initLines),
			'',
			indentLines(toJSONLines),
			`}`
		]), [
		R.prop('name'),
		R.pipe(
			R.prop('cases'),
			initMethodForCases
		),
		R.pipe(
			R.prop('cases'),
			toJSONMethodForCases
		)
	]),
	R.join('\n')
)

module.exports = codeForJSON
