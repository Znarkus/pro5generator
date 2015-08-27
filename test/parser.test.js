'use strict';

var should = require('should');
var Parser = require('../lib/parser');
var Promise = require('bluebird');
var readFile = Promise.promisify(require('fs').readFile);

describe('Parser', function() {
	describe('#initialNumber', function() {
		it('should work', function() {
			var r = Parser.initialtNumber(
				'Ve er som lägger hus till hus och fogar åker till åker, till dess inget utrymme längre finns och ni är de enda som bor i landet.'
			);

			should(r.number).be.null;
		});

		it('should work 2', function() {
			var r = Parser.initialtNumber(
				'När ni bärgar in skörden, ska ni inte skörda i hörnen och längs kanterna av fältet, och inte heller plocka upp ax som ligger kvar på marken.10 Samma sak gäller vinskörden.'
			);

			should(r.number).be.null;
		});

		it('should work 3', function() {
			var r = Parser.initialtNumber(
				'1 När Jesus fick veta att fariséerna hade hört att flera kom till honom än till Johannes för att döpas och bli lärjungar - 2 Jesus döpte dem inte själv utan lärjungarna gjorde det -			3 lämnade han Judeen och återvände till Galileen. '
			);

			should(r.number).be.eql(Parser.createNumber(1));
		});

		it('should work 4', function() {
			var r = Parser.initialtNumber(
				'5-6 När han mitt på dagen närmade sig staden Sykar kom han till Jakobs brunn, som ligger på den mark som Jakob gav sin son Josef. Jesus var trött av den långa vandringen och satte sig vid brunnen.			7 Efter en stund kom en samarisk kvinna för att hämta vatten och Jesus bad henne att få lite att dricka.'
			);

			should(r.number).be.eql(Parser.createNumber(5, 6));
		});
	});


	describe('#nextNumber', function() {
		it('should work', function() {
			var text = 'Ve er som lägger hus till hus och fogar åker till åker, till dess inget utrymme längre finns och ni är de enda som bor i landet.';
			var r = Parser.nextNumber(text, Parser.initialtNumber(text).number);

			should(r.number).be.null;
		});

		it('should work 2', function() {
			var text = 'När ni bärgar in skörden, ska ni inte skörda i hörnen och längs kanterna av fältet, och inte heller plocka upp ax som ligger kvar på marken.10 Samma sak gäller vinskörden.';
			var r = Parser.nextNumber(text, Parser.initialtNumber(text).number);

			should(r.number).be.eql(Parser.createNumber(10));
		});

		it('should work 3', function() {
			var text = '1 När Jesus fick veta att fariséerna hade hört att flera kom till honom än till Johannes för att döpas och bli lärjungar - 2 Jesus döpte dem inte själv utan lärjungarna gjorde det -			3 lämnade han Judeen och återvände till Galileen. ';
			var r = Parser.nextNumber(text, Parser.initialtNumber(text).number);

			should(r.number).be.eql(Parser.createNumber(2));
		});

		it('should work 4', function() {
			var text = '5-6 När han mitt på dagen närmade sig staden Sykar kom han till Jakobs brunn, som ligger på den mark som Jakob gav sin son Josef. Jesus var trött av den långa vandringen och satte sig vid brunnen.			7 Efter en stund kom en samarisk kvinna för att hämta vatten och Jesus bad henne att få lite att dricka.';
			var r = Parser.nextNumber(text, Parser.initialtNumber(text).number);

			should(r.number).be.eql(Parser.createNumber(7));
		});

		it('should work 5', function() {
			var text = 'Awd awd awd 5-6 När han mitt på dagen närmade sig staden Sykar kom han till Jakobs brunn, som ligger på den mark som Jakob gav sin son Josef. Jesus var trött av den långa vandringen och satte sig vid brunnen.			7 Efter en stund kom en samarisk kvinna för att hämta vatten och Jesus bad henne att få lite att dricka.';
			var r = Parser.nextNumber(text, Parser.initialtNumber(text).number);

			should(r.number).be.eql(Parser.createNumber(5, 6));
		});

		it('should work 6', function() {
			var text = '4 Awd awd awd 5-6 När han mitt på dagen närmade sig staden Sykar kom han till Jakobs brunn, som ligger på den mark som Jakob gav sin son Josef. Jesus var trött av den långa vandringen och satte sig vid brunnen.			7 Efter en stund kom en samarisk kvinna för att hämta vatten och Jesus bad henne att få lite att dricka.';
			var r = Parser.nextNumber(text, Parser.initialtNumber(text).number);

			should(r.number).be.eql(Parser.createNumber(5, 6));
		});

		it('should work 7', function() {
			var text = '3-4 Awd awd awd 5-6 När han mitt på dagen närmade sig staden Sykar kom han till Jakobs brunn, som ligger på den mark som Jakob gav sin son Josef. Jesus var trött av den långa vandringen och satte sig vid brunnen.			7 Efter en stund kom en samarisk kvinna för att hämta vatten och Jesus bad henne att få lite att dricka.';
			var r = Parser.nextNumber(text, Parser.initialtNumber(text).number);

			should(r.number).be.eql(Parser.createNumber(5, 6));
		});

		it('should work 8', function() {
			var text = 'Efter en stund kom en samarisk kvinna för att hämta vatten och Jesus bad henne att få lite att dricka.';
			var r = Parser.nextNumber(text, Parser.createNumber(7));

			should(r.number).be.null;
		});
	});

	describe('TextRange', function() {
		it('should work', function() {
			var tr = new Parser.TextRange('12 Foo bar 13-14', 3, null, 3);
			should(tr.textBefore()).be.equal('12 ');
			should(tr.textAfter()).be.equal(' bar 13-14');
		});
	});

	describe('#splitVerses', function() {
		it('should handle no number', function() {
			var versesString = 'Ve er ';
			var verses = Parser.splitVerses(versesString);

			should(verses).be.eql([
				{ number: null, text: 'Ve er' }
			]);
		});

		it('should work without first number', function() {
			var versesString = 'När ni.10 Samma sak.';
			var verses = Parser.splitVerses(versesString);

			should(verses).be.eql([
				{ number: null, text: 'När ni.' },
				{ number: { from: 10, to: 10 }, text: 'Samma sak.' }
			]);
		});

		it('should work with first number', function() {
			var versesString = '10 Samma sak.';
			var verses = Parser.splitVerses(versesString);

			should(verses).be.eql([
				{ number: { from: 10, to: 10 }, text: 'Samma sak.' }
			]);
		});

		it('should handle range verses', function() {
			var versesString = '5-6 När 7 Efter 8 Han mat.';
			var verses = Parser.splitVerses(versesString);

			should(verses).be.eql([
				{ number: { from: 5, to: 6 }, text: 'När' },
				{ number: { from: 7, to: 7 }, text: 'Efter' },
				{ number: { from: 8, to: 8 }, text: 'Han mat.' }
			]);
		});

		it('should handle range verses 2', function() {
			var versesString = '1 När Jesus - 2 Jesus döpte - 3 lämnade. 4 På vägen. 5-6 När han. 7 Efter en. 8-9 Efter en. 10. aWD. 11. aaa. 12. bbb. 13. ccc. 14. ddd. 15. eee. 16. fff. 17-18. ggg. 19. hhh';
			var verses = Parser.splitVerses(versesString);

			should(verses).be.eql([
				{ number: { from: 1, to: 1 }, text: 'När Jesus -' },
				{ number: { from: 2, to: 2 }, text: 'Jesus döpte -' },
				{ number: { from: 3, to: 3 }, text: 'lämnade.' },
				{ number: { from: 4, to: 4 }, text: 'På vägen.' },
				{ number: { from: 5, to: 6 }, text: 'När han.' },
				{ number: { from: 7, to: 7 }, text: 'Efter en.' },
				{ number: { from: 8, to: 9 }, text: 'Efter en.' },
				{ number: { from: 10, to: 10 }, text: '. aWD.' },
				{ number: { from: 11, to: 11 }, text: '. aaa.' },
				{ number: { from: 12, to: 12 }, text: '. bbb.' },
				{ number: { from: 13, to: 13 }, text: '. ccc.' },
				{ number: { from: 14, to: 14 }, text: '. ddd.' },
				{ number: { from: 15, to: 15 }, text: '. eee.' },
				{ number: { from: 16, to: 16 }, text: '. fff.' },
				{ number: { from: 17, to: 18 }, text: '8. ggg.' },
				{ number: { from: 19, to: 19 }, text: '. hhh' }
			]);
		});

		it('should handle single range verse', function() {
			var versesString = '14-16 Now that we know what we have—Jesus, this great High Priest';
			var verses = Parser.splitVerses(versesString);

			should(verses).be.eql([
				{ number: { from: 14, to: 16 },
				text: 'Now that we know what we have—Jesus, this great High Priest' }
			]);
		});
	});
});
