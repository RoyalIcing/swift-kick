const R = require('ramda')
const stdio = require('stdio')

const parseEnum = require('./parseEnum')
const codeForKind = require('./codeForKind')
const codeForJSON = require('./codeForJSON')

const task = R.prop(2, process.argv)
const args = R.drop(3, process.argv)

switch (task) {
case 'parse-enum':
	stdio.read((code) => {
		console.log(
			JSON.stringify(parseEnum(code), null, 2)
		)
	})
	break
case 'enum-json':
	stdio.read((code) => {
		const enumTree = parseEnum(code) 
		console.log(
			R.join('\n', [
				codeForKind(enumTree),
				'',
				codeForJSON(enumTree)
			])
		)
	})
	break
default:
	console.error(`unknown task ${task}`)
}
