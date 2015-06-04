'use strict';

var should = require('should');
var Parser = require('../lib/parser');

describe('Parser', function() {
	describe('#splitVerses', function() {
		it('should handle no number', function() {
			var versesString = 'Ve er som lägger hus till hus och fogar åker till åker, till dess inget utrymme längre finns och ni är de enda som bor i landet.';
			var verses = Parser.splitVerses(versesString);

			should(verses.length).be.equal(1);
			should(verses[0].number).be.undefined;
			should(verses[0].text).be.equal(versesString);
		});

		it('should work without first number', function() {
			var versesString = 'När ni bärgar in skörden, ska ni inte skörda i hörnen och längs kanterna av fältet, och inte heller plocka upp ax som ligger kvar på marken.10 Samma sak gäller vinskörden.';
			var verses = Parser.splitVerses(versesString);

			console.log(verses);
			should(verses.length).be.equal(2);
			should(verses[0].number).be.undefined;
			should(verses[1].number).be.equal(10);
			should(verses[1].text).be.equal('Samma sak gäller vinskörden.');
		});

		//it('should handle range verses', function() {
		//	var versesString = '14-16 Now that we know what we have—Jesus, this great High Priest with ready access to God—let’s not let it slip through our fingers. We don’t have a priest who is out of touch with our reality.';
		//	var verses = Parser.splitVerses(versesString);
		//
		//	console.log(verses);
		//	should(verses.length).be.equal(2);
		//	should(verses[0].number).be.undefined;
		//	should(verses[1].number).be.equal(10);
		//	should(verses[1].text).be.equal('Samma sak gäller vinskörden.');
		//});
	});
});