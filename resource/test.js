var libxmljs = require('libxmljs');
var fs = require('fs');
//var rtfjs = require('rtf.js');
var _ = require('lodash');

fs.readFile('test.pro5', function(e, xml) {
	var xmlDoc = libxmljs.parseXml(xml);

	//console.log(xmlDoc.toString());
	// xpath queries
	xmlDoc.find('//RVTextElement').forEach(function(textElement) {
		var attr = textElement.attr('RTFData');
		var rtfData = attr.value();
		var buffer = new Buffer(rtfData, 'base64');
		var string = buffer.toString('ascii');

		console.log(string);
	});
});
