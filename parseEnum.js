const R = require('ramda')

const tapLog = (id) => R.tap(input => console.log(id, input))

const parseName = R.pipe(
    R.match(/\s?public enum ([^\s:]+).+{/),
    R.prop(1)
)

const parseAssociated = R.pipe(
    R.split(/,\s?/),
    R.map(R.pipe(
        R.match(/([^:\s]+)[:\s]+(.+)/),
        R.tail,
        R.zipObj(['name', 'type'])
    ))
)
    
const parseCases = R.pipe(
    R.match(/\s?case[\s\S]+?\)/gm),
    R.map(R.pipe(
        R.match(/case (.+?)\(([\s\S]+)\)/),
        R.tail,
        R.over(R.lensIndex(1), parseAssociated),
        R.zipObj(['name', 'associated'])
    ))
)

const parseEnum = R.converge(
    (name, cases) => ({
        name,
        cases
    }), [
        parseName,
        parseCases
    ]
)

module.exports = parseEnum
