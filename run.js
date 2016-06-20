const R = require('ramda')
const stdio = require('stdio')

const parseEnum = require('./src/parseEnum')
const codeForKind = require('./src/code-generation/kind')
const codeForJSON = require('./src/code-generation/json')
const { equatesFuncForEnum } = require('./src/code-generation/equatable')

const task = R.prop(2, process.argv)
const args = R.drop(3, process.argv)

const pipeStdin = (...funcs) => {
	stdio.read((code) => {
		console.log(R.pipe(
			...funcs
		)(code))
	})
}

switch (task) {
case 'enum:parse':
	stdio.read((code) => {
		console.log(
			JSON.stringify(parseEnum(code), null, 2)
		)
	})
	break
case 'enum:json':
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
case 'enum:eq':
	stdio.read((code) => {
		const enumTree = parseEnum(code) 
		console.log(
			R.join('\n', equatesFuncForEnum(enumTree))
		)
	})
	break
default:
	console.error(`unknown task ${task}`)
}
