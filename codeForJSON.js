const R = require('ramda')

const indentLines = require('./indentLines')

const tapLog = (id) => R.tap(input => console.log(id, input))

const decodeMethodForType = R.cond([
	[R.equals('NSUUID'), R.always(name => `decodeUUID("${name}")`)],
	[R.equals('NSData'), R.always(name => `decodeData("${name}")`)],
	[R.equals('NSURL'), R.always(name => `decodeURL("${name}")`)],
	[R.test(/\?$/), R.always(name => `decodeOptional("${name}")`)],
	[R.T, R.always(name => `decode("${name}")`)]
])

const decodeForAssociated = R.curry((caseName, associated) => (
	`${
		R.ifElse(
			R.isNil,
			R.always(''),
			(t) => `${t}:`
		)(associated.name)
	} source.${
		decodeMethodForType(associated.type)(R.defaultTo(caseName, associated.name))
	}`
))

const commaLine = (line) => `${line},`
const commaLines = R.converge(
	R.concat, [
		R.pipe(
			R.init,
			R.map(commaLine)
		),
		R.last
	])

const initForCase = R.converge((name, decodes) => R.flatten([
	`case .${name}:`
].concat(!R.isEmpty(decodes) ? [
	`\tself = try .${name}(`,
	indentLines(indentLines(commaLines(decodes))),
	`\t)`
] : [
	`\tself = .${name}`
])
	
), [
	R.prop('name'),
	R.converge((associated, caseName) => R.map(
		decodeForAssociated(caseName),
		associated
	), [
		R.prop('associated'),
		R.prop('name')	
	])
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


const assignForAssociatedName = (name) => (
	`"${ name }": ${ name }.toJSON()`
)

const toJSONForCase = R.converge((name, associatedNames) => R.flatten([
	!R.isEmpty(associatedNames) ? (
		`case let .${name}(${
			R.join(', ', associatedNames)
		}):`
	) : (
		`case .${name}:`
	),
	`\treturn .ObjectValue([`,
	indentLines(indentLines(commaLines(
		[
			`"type": Kind.${name}.toJSON()`
		].concat(R.map(assignForAssociatedName, associatedNames))
	))),
	`\t])`
]), [
	R.prop('name'),
	R.converge(R.pipe(
		R.map,
		R.pluck('name')
	), [
		R.pipe(
			R.pick(['name']),
			R.mergeWith(R.defaultTo) // Merge overriding explicit undefined
		),
		R.propOr([], 'associated')
	])
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
