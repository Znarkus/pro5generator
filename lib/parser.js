'use strict';

var _ = require('lodash');

exports.parseText = parseText;
exports.splitVerses = splitVerses;
exports.nextNumber = nextNumber;
exports.initialtNumber = initialtNumber;
exports.createNumber = createNumber;
exports.TextRange = TextRange;

function parseText(text) {
	// Trim every row so split(\n{2,}) works properly
	var mainParts = text.split('\n').map(_.trim).join('\n').split(/\n{2,}/);
	var slides = [];

	_.forEach(mainParts, function(part) {
//			var match;

		part = _.omit(part.split('\n').map(_.trim), _.isEmpty);
		 //part = _.values(_.omit(part.split('\n').map(_.trim), _.isEmpty));

		if (_.size(part) == 1) {
			// Title
			slides.push({ title: part[0] });
		} else {
			part = { reference: part[0].toUpperCase(), verse: _.slice(_.values(part), 1).join(' ') };

			_.forEach(splitVerses(part.verse), function(verse) {
				var slide = _.clone(part);
				verse.number = verse.number ? verse.number.toString() : verse.number;
				slide.verse = verse;
				slides.push(slide);
			});
		}

//			mainParts[index] = part;
	});

	return slides;
}

function splitVerses(versesString) {
	var verses = [];
	var currentNumber = initialtNumber(versesString);
	var nextNum = nextNumber(
		currentNumber.textRange ? currentNumber.textRange.textAfter() : versesString,
		currentNumber.number
	);

	do {
		verses.push(createVerse(
			nextNum.textRange ? nextNum.textRange.textBefore() : (currentNumber.textRange ? currentNumber.textRange.textAfter() : versesString),
			currentNumber.number
		));

		if (!nextNum.number) {
			break;
		}

		currentNumber = nextNum;
		versesString = currentNumber.textRange.textAfter().trim();
		nextNum = nextNumber(versesString, currentNumber.number);
	} while (true);

	return verses;
}

//function splitVerses(versesString) {
//	var oneNumberRegex = /^\d+/;
//	var rangeNumbersRegex = /^(\d\s*[-–]\s*\d)+\s*(.+)$/;
//	var match = versesString.match(oneNumberRegex);		// First verse number
//	var rangeMatch = versesString.match(rangeNumbersRegex);		// First verse number
//	var verses = [];
//
//	if (rangeMatch) {
//		return [createVerse(rangeMatch[2], rangeMatch[1])];
//	}
//
//	if (!match) {
//		return [createVerse(versesString)];
//	}
//
//	for (var verseNumber = _.parseInt(match[0]); versesString; verseNumber++) {
//		var nextVerseNumber = verseNumber + 1;
//		var nextIndex = versesString.indexOf(nextVerseNumber);	// Position of next verse number
//		var verse;
//
////			match = versesString.match(new RegExp(nextVerseNumber));		// First verse number
//		rangeNumbersRegex = new RegExp('(' + verseNumber + ')\\s*[-–]\\s*(\\d+)+\\s*(.+)$');
//		rangeMatch = versesString.match(rangeNumbersRegex);		// First verse number
//
//		if (nextIndex > -1) {
//			if (nextIndex < 5) {	// Next verse number must be at least 5 chars away
//				if (rangeMatch) {
//					nextVerseNumber = _.parseInt(rangeMatch[2]) + 1;
//					nextIndex = versesString.indexOf(nextVerseNumber);
//					verse = versesString.substr(0, nextIndex);
//					versesString = versesString.substr(nextIndex);
//					verses.push(createVerse(verse, rangeMatch[1] + '-' + rangeMatch[2]));
//					verseNumber = nextVerseNumber - 1;
//					continue;
//				} else {
//					break;	// Dunno
//				}
//			} else {
//				verse = versesString.substr(0, nextIndex);
//				versesString = versesString.substr(nextIndex);
//			}
//		} else {
//			verse = versesString;
//			versesString = '';
//		}
//
//		verses.push(createVerse(verse, verseNumber));
//	}
//
//	return verses;
//}

function nextNumber(text, currentNumber) {
	var nextNumber = currentNumber ? currentNumber.to + 1 : null;
	var rangeRegex = new RegExp('[^0-9]((' + (nextNumber ? nextNumber : '\\d+') + ')\\s*[-–]\\s*(\\d+)+\\s*)(.+)$');
	var match = text.match(rangeRegex);
	var textRange;

	if (match) {
		// Range match
		nextNumber = createNumber(match[2], match[3]);
		textRange = TextRange.fromSnippet(text, match.index, match[1]);
	} else if (!nextNumber) {
		// No initial number, no next number. Find the first number
		match = text.match(/\d+/);

		if (match) {
			nextNumber = createNumber(match[0]);
			textRange = TextRange.fromSnippet(text, match.index, match[0]);
		} else {
			nextNumber = null;
		}
	} else {
		// Find nextNumber
		match = text.indexOf(nextNumber);
		nextNumber = match > -1 ? createNumber(nextNumber) : null;
		textRange = match > -1 ? TextRange.fromSnippet(text, match, nextNumber.from) : null;
	}

	return {
		textRange: nextNumber ? textRange : null,
		number: nextNumber ? nextNumber : null
	};
}

function initialtNumber(text) {
	var rangeRegex = new RegExp('^((\\d+)\\s*[-–]\\s*(\\d+)+\\s*)(.+)$');
	var match = text.match(rangeRegex);

	if (match) {
		return {
			textRange: TextRange.fromSnippet(text, 0, match[1]),
			number: createNumber(match[2], match[3])
		};
	} else {
		match = text.match(/^\d+/);
		return {
			textRange: match ? TextRange.fromSnippet(text, 0, match[0]) : null,
			number: match ? createNumber(match[0]) : null
		};
	}
}

function TextRange(text, from, to, length) {
	this.text = text;
	this.from = _.parseInt(from);
	this.to = to ? _.parseInt(to) : this.from + _.parseInt(length);
}

TextRange.fromSnippet = function(text, from, snippet) {
	return new TextRange(text, from, null, ('' + snippet).length);
};

TextRange.prototype.textBefore = function() {
	return this.text.substring(0, this.from);
};

TextRange.prototype.textAfter = function() {
	return this.text.substring(this.to);
};

TextRange.prototype.toString = function() {
	return this.text.substring(this.from, this.to);
};

function createNumber(from, to) {
	//return { from: _.parseInt(from), to: _.parseInt(to ? to : from) };
	return new NumberRange(from, to);
}

function NumberRange(from, to) {
	this.from = _.parseInt(from);
	this.to = _.parseInt(to ? to : from);
}

NumberRange.prototype.toString = function() {
	return this.from == this.to ? '' + this.from : this.from + '-' + this.to;
};

function createVerse(text, number) {
	return {
		number: number,
		//text: text.replace(new RegExp('^' + number + '\\s*'), '')
		text: text.trim()
	};
}
