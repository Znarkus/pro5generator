var _ = require('lodash');

console.log(convertUnicode('aaåbb'));

function convertUnicode(string) {
	var newString = '';

	_.forEach(string, function(char) {
		var charCode = char.charCodeAt(0);
		//console.log(char, charCode);

		if (charCode > 127) {
			char = '\\\'' + charCode.toString(16);
		}

		newString += char;
	});

	return newString;
}
