'use strict';

var _ = require('lodash');

exports.parseText = parseText;
exports.splitVerses = splitVerses;

function parseText(text) {
	var mainParts = text.split(/\n{2,}/);
	var slides = [];

	_.forEach(mainParts, function(part) {
//			var match;

		part = _.omit(part.split('\n').map(_.trim), _.isEmpty);

		if (_.size(part) == 1) {
			// Title
			slides.push({ title: part[0] });
		} else {
			part = { reference: part[0], verse: _.slice(_.values(part), 1).join(' ') };

			_.forEach(splitVerses(part.verse), function(verse) {
				var slide = _.clone(part);
				slide.verse = verse;
				slides.push(slide);
			});
		}

//			mainParts[index] = part;
	});

	console.log(slides);

	return slides;
}

function splitVerses(versesString) {
	var oneNumberRegex = /^\d+/;
	var rangeNumbersRegex = /^(\d\s*[-–]\s*\d)+\s*(.+)$/;
	var match = versesString.match(oneNumberRegex);		// First verse number
	var rangeMatch = versesString.match(rangeNumbersRegex);		// First verse number
	var verses = [];

	if (rangeMatch) {
		return [createVerse(rangeMatch[2], rangeMatch[1])];
	}

	if (!match) {
		return [createVerse(versesString)];
	}

	for (var verseNumber = _.parseInt(match[0]); versesString; verseNumber++) {
		var nextVerseNumber = verseNumber + 1;
		var nextIndex = versesString.indexOf(nextVerseNumber);	// Position of next verse number
		var verse;

//			match = versesString.match(new RegExp(nextVerseNumber));		// First verse number
		rangeNumbersRegex = new RegExp('(' + verseNumber + ')\\s*[-–]\\s*(\\d+)+\\s*(.+)$');
		rangeMatch = versesString.match(rangeNumbersRegex);		// First verse number

		if (nextIndex > -1) {
			if (nextIndex < 5) {	// Next verse number must be at least 5 chars away
				if (rangeMatch) {
					nextVerseNumber = _.parseInt(rangeMatch[2]) + 1;
					nextIndex = versesString.indexOf(nextVerseNumber);
					verse = versesString.substr(0, nextIndex);
					versesString = versesString.substr(nextIndex);
					verses.push(createVerse(verse, rangeMatch[1] + '-' + rangeMatch[2]));
					verseNumber = nextVerseNumber - 1;
					continue;
				} else {
					break;	// Dunno
				}
			} else {
				verse = versesString.substr(0, nextIndex);
				versesString = versesString.substr(nextIndex);
			}
		} else {
			verse = versesString;
			versesString = '';
		}

		verses.push(createVerse(verse, verseNumber));
	}

	return verses;
}

function createVerse(text, number) {
	return { number: number, text: text.replace(new RegExp('^' + number + '\\s*'), '') };
}