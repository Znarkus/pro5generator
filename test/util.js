'use strict';

exports.verseString = verseString

function verseString (strings, ...values) {
	var words = strings.join('').split(' ');
	return words.slice(0, -4).join(' ') + ' ' + words.slice(-4).join('\xA0')
}