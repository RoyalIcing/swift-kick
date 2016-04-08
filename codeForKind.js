const R = require('ramda')

const indentLines = require('./indentLines')


const kindEnumForCases = R.pipe(
    R.map((id) => `case ${id} = "${id}"`),
    (lines) => R.flatten([
        'public enum Kind : String, KindType {',
        indentLines(lines),
        '}'
    ])
)

const kindPropForCases = R.pipe(
    R.map(id => `case .${id}: return .${id}`),
    (lines) => R.flatten([
        'public var kind: Kind {',
        '\tswitch self {',
        indentLines(lines),
        '\t}',
        '}'
    ])
)

const codeForCases = R.converge(
    (enumCode, kindProp) => (
        `${enumCode}\n\n${kindProp}`
    ), [
        kindEnumForCases,
        kindPropForCases
    ]
)

const codeForKind = R.pipe(
    R.converge(
        (name, kindEnumLines, kindPropLines) => R.flatten([
            `extension ${name} {`,
            indentLines(kindEnumLines),
            '',
            indentLines(kindPropLines),
            `}`
        ]), [
        R.prop('name'),
        R.pipe(
            R.prop('cases'),
            R.pluck('name'),
            kindEnumForCases
        ),
        R.pipe(
            R.prop('cases'),
            R.pluck('name'),
            kindPropForCases
        )
    ]),
    R.join('\n')
)

module.exports = codeForKind
