'use strict';

var should = require('should');
var Parser = require('../lib/parser');
var Promise = require('bluebird');
var readFile = Promise.promisify(require('fs').readFile);
var _ = require('lodash');
var verseString = require('./util').verseString;

describe('parseText', function() {
	it('should work', function() {
		var text = 'SKAPA RUM FÖR GUD\n\n\nPSALTAREN 62:6-9 (SFB)\n6 Endast i Gud har du din ro,';
		var parsed = Parser.parseText(text);

		should(parsed).be.eql([
			{
				"title": "SKAPA RUM FÖR GUD"
			},
			{
				"reference": "PSALTAREN 62:6-9 (SFB)",
				"verse": {
					"number": "6",
					"text": verseString`Endast i Gud har du din ro,`
				}
			}
		]);
	});

	it('should add nbsp correctly', function() {
		should(
			Parser.parseText('SKAPA\n\n\nPSALTAREN\n6 Endast i Gud har')
		).be.eql([
			{
				"title": "SKAPA"
			},
			{
				"reference": "PSALTAREN",
				"verse": {
					"number": "6",
					"text": `Endast i Gud har`
				}
			}
		]);

		should(
			Parser.parseText('SKAPA\n\n\nPSALTAREN\n6 Endast i Gud har du')
		).be.eql([
			{
				"title": "SKAPA"
			},
			{
				"reference": "PSALTAREN",
				"verse": {
					"number": "6",
					"text": `Endast i Gud har du`
				}
			}
		]);

		should(
			Parser.parseText('SKAPA\n\n\nPSALTAREN\n6 Endast i Gud har du din')
		).be.eql([
			{
				"title": "SKAPA"
			},
			{
				"reference": "PSALTAREN",
				"verse": {
					"number": "6",
					"text": `Endast i Gud har du din`
				}
			}
		]);
		
		should(
			Parser.parseText('SKAPA\n\n\nPSALTAREN\n6 Endast i Gud har du din ro,')
		).be.eql([
			{
				"title": "SKAPA"
			},
			{
				"reference": "PSALTAREN",
				"verse": {
					"number": "6",
					"text": `Endast i Gud har\xA0du\xA0din\xA0ro,`
				}
			}
		]);
	});

	it('should handle unicode weirdness', function() {
		should(
			Parser.parseText('Psaltaren 56:9 (SFB15)\n6 Du ha\u030aller ra\u0308kning o\u0308verge dig.')
		).be.eql([
			{
				"reference": "PSALTAREN 56:9 (SFB15)",
				"verse": {
					"number": "6",
					"text": `Du håller räkning överge dig.`
				}
			}
		]);
	});

	it('should handle non-empty blank rows', function(done) {
		readFile(__dirname + '/resource/parseText-test1.txt').then(function(text) {
			var parsed = Parser.parseText(text.toString('utf8'));
			//console.log(JSON.stringify(parsed, null, 2));

			should(parsed).be.eql([
				{
					"title": "WHATEVER IT TAKES!"
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "24",
						"text": verseString`Då gick Jesus med honom. Mycket folk följde efter och trängde sig inpå honom.`
					}
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "25",
						"text": verseString`Där var en kvinna som hade haft blödningar i tolv år.`
					}
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "26",
						"text": verseString`Fast hon hade lidit mycket hos många läkare och lagt ut allt hon ägde, hade hon inte fått någon hjälp. Det hade bara blivit sämre med henne.`
					}
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "27",
						"text": verseString`Hon hade hört talas om Jesus, och nu kom hon bakifrån i folkmassan och rörde vid hans mantel.`
					}
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "28",
						"text": verseString`Hon tänkte: "Om jag så bara rör vid hans kläder blir jag frisk."`
					}
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "29",
						"text": verseString`På en gång upphörde hennes blödningar, och hon kände i kroppen att hon var botad från sin plåga.`
					}
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "30",
						"text": verseString`När Jesus märkte att det hade gått ut kraft från honom, vände han sig om i folkskaran och frågade: "Vem rörde vid mina kläder?"`
					}
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "31",
						"text": verseString`Hans lärjungar sade till honom: "Du ser hur folket tränger sig inpå dig, och du frågar: Vem rörde vid mig?"`
					}
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "32",
						"text": verseString`Han fortsatte att se sig omkring efter kvinnan som hade gjort detta.`
					}
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "33",
						"text": verseString`Hon visste vad som hade skett med henne och kom förskräckt och darrande och föll ner för honom och talade om hela sanningen för honom.`
					}
				},
				{
					"reference": "MARKUSEVANGELIET 5:24-34 (SFB)",
					"verse": {
						"number": "34",
						"text": verseString`Då sade han till henne: "Min dotter, din tro har frälst dig. Gå i frid och var frisk och fri från din plåga!"`
					}
				},
				{
					"reference": "HEBREERBREVET 12:2 (SFB2014)",
					"verse": {
						"number": null,
						"text": verseString`Och låt oss ha blicken fäst på Jesus, trons upphovsman och fullkomnare. För att nå den glädje som låg framför honom uthärdade han korset, utan att bry sig om skammen, och sitter nu på högra sidan om Guds tron.`
					}
				}
			]);

			done();
			//should(parsed).be.eql();
		});
	});
});
