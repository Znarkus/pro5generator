var libxmljs = require('libxmljs');
var fs = require('fs');
//var rtfjs = require('rtf.js');
var _ = require('lodash');
var content = {
	PREACHTITLE: 'GUDS KRAFT I DITT LIV',
	BIBLEREFERENCE: 'APOSTLAGÄRNINGARNA 2:1-4 (SFB)',
	BIBLEVERSE: '1 När pingstdagen hade kommit var de alla samlade. 2 Då kom plötsligt från himlen ett dån, som när en våldsam storm drar fram, och det fyllde hela huset där de satt.'
};

fs.readFile('preach.pro5', function(e, xml) {
	var xmlDoc = libxmljs.parseXml(xml);

	//console.log(xmlDoc.toString());
	// xpath queries
	xmlDoc.find('//RVTextElement').forEach(function(textElement) {
		var attr = textElement.attr('RTFData');
		var rtfData = attr.value();
		var buffer = new Buffer(rtfData, 'base64');
		var string = buffer.toString('ascii');

		if (string.indexOf('BIBLEREFERENCE') > -1) {
			cloneSlide(findParent(xmlDoc, 'RVDisplaySlide', textElement));
			fs.writeFile('generated.pro5', xmlDoc.toString());
			return false;
		}
	});
});

function cloneSlide(slide) {
	slide.addNextSibling(slide.clone());
}

function findParent(doc, searchElement, startElement) {
	var path = startElement.path();
	return doc.get(path.substr(0, path.indexOf(searchElement) + searchElement.length));
}
