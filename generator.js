var libxmljs = require('libxmljs');
var fs = require('fs');
//var rtfjs = require('rtf.js');
var _ = require('lodash');
var content = [
	{ title: 'GUDS KRAFT I DITT LIV' },
	{
		reference: 'APOSTLAGÄRNINGARNA 2:1-4 (SFB)',
		verse: '1 När pingstdagen hade kommit var de alla samlade. 2 Då kom plötsligt från himlen ett dån, som när en våldsam storm drar fram, och det fyllde hela huset där de satt.'
	},
	{
		reference: 'APOSTLAGÄRNINGARNA 2:1-4 (SFB)',
		verse: '3 Tungor som av eld visade sig för dem och fördelade sig och satte sig på var och av dem.'
	}
];

fs.readFile('preach.pro5', function(e, xml) {
	var xmlDoc = libxmljs.parseXml(xml);
	var titleSlide;
	var verseSlide;
	var lastSlide;

	//xmlDoc.find('//RVTextElement').forEach(function(textElement) {
	//	var attr = textElement.attr('RTFData');
	//	var rtfData = attr.value();
	//	var buffer = new Buffer(rtfData, 'base64');
	//	var string = buffer.toString('ascii');

	forEachSlideTexts(xmlDoc, function(textElement, attr, string) {
		if (string.indexOf('BIBLEREFERENCE') > -1) {
			verseSlide = findParent(xmlDoc, 'RVDisplaySlide', textElement);
		} else if (string.indexOf('PREACHTITLE') > -1) {
			titleSlide = findParent(xmlDoc, 'RVDisplaySlide', textElement);
		}
	});

	lastSlide = verseSlide;

	_.forEach(content.reverse(), function(node) {
		var slide;

		if (node.title) {
			slide = titleSlide.clone();

			forEachSlideTexts(slide, function(textElement, attr, string) {
				string = string.replace('PREACHTITLE', convertUnicode(node.title));
				attr.value(new Buffer(string).toString('base64'));
			});
		} else {
			slide = verseSlide.clone();

			forEachSlideTexts(slide, function(textElement, attr, string) {
				string = string.replace('BIBLEVERSE', convertUnicode(node.verse));
				string = string.replace('BIBLEREFERENCE', convertUnicode(node.reference));
				attr.value(new Buffer(string).toString('base64'));
			});
		}

		var all = xmlDoc.find('//RVDisplaySlide');
		all[all.length - 1].addPrevSibling(slide);
		//lastSlide = slide;
	});

	/*xmlDoc.find('//RVTextElement').forEach(function(textElement) {
		var attr = textElement.attr('RTFData');
		var rtfData = attr.value();
		var buffer = new Buffer(rtfData, 'base64');
		var string = buffer.toString('ascii');


		_.forEach(content, function(text, key) {
			string = string.replace(key, convertUnicode(text));
		});

		console.log(string);
		attr.value(new Buffer(string).toString('base64'));
	});*/

	fs.writeFile('generated.pro5', xmlDoc.toString());
});

//function cloneSlide(slide) {
//	slide.addNextSibling(slide.clone());
//}

function forEachSlideTexts(root, cb) {
	root.find('.//RVTextElement').forEach(function(textElement) {
		var attr = textElement.attr('RTFData');
		var rtfData = attr.value();
		var buffer = new Buffer(rtfData, 'base64');
		var string = buffer.toString('ascii');
		cb(textElement, attr, string);
	});
}

function findParent(doc, searchElement, startElement) {
	var path = startElement.path();
	return doc.get(path.substr(0, path.indexOf(searchElement) + searchElement.length));
}

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
