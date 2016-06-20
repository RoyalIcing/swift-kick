const parseEnum = require('./parseEnum')
const codeForKind = require('./code-generation/kind')
const codeForJSON = require('./code-generation/json')
const { equatesFuncForEnum } = require('./code-generation/equatable')

export class Enum {
	constructor(string) {
		this.enumTree = parseEnum(string)
	}

	generateEquatesFunc() {
		return equatesFuncForEnum(this.enumTree).join('\n')
	}
}

export default {
	Enum
}
