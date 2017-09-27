'use strict';

var libxmljs = require('libxmljs');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var _ = require('lodash');
var base = require('base-converter');
var moment = require('moment');
var debug = require('debug')('app');
var Path = require('path');
var uuidv4 = require('uuid/v4');
var highlightColors = [
	'0 0 1 1',
	'0.6000000238418579 0.4000000059604645 0.2000000029802322 1',
	'0 1 1 1',
	'0 1 0 1',
	'1 0 1 1',
	'1 0.5 0 1',
	'0.5 0 0.5 1',
	'1 0 0 1',
	'1 1 0 1',
	'1 1 1 1'
];

exports.generate = function(templatePath, content, outputDir) {
  const ext = Path.extname(templatePath)
	var outputPath = Path.resolve(
		outputDir,
		moment().format('YYYY-MM-DD-') + base.decTo62(new Date().getTime()) + ext
	);

	return fs.readFileAsync(templatePath)
		.then(function(xml) {
		  const proParser = ext === '.pro5' ? Pro5 : Pro6

			var xmlDoc = libxmljs.parseXml(xml);
			var highlightColorIndex = 0;
			var titleSlide;
			var verseSlide;
			var lastNode;

			proParser.forEachSlideTexts(xmlDoc, function(textElement, string) {
				if (string.indexOf('BIBLEREFERENCE') > -1) {
					verseSlide = findParent('RVDisplaySlide', textElement);
				} else if (string.indexOf('PREACHTITLE') > -1) {
					titleSlide = findParent('RVDisplaySlide', textElement);
				}
			});

			_.forEach(content, function(node, slideCount) {
				var xmlSlide;

				debug(node);

				if (node.title) {
					xmlSlide = titleSlide.clone();

					proParser.forEachSlideTexts(xmlSlide, function(textElement, string, updateTextCb) {
            debug('TITLE Text element: %s', string);

            string = string.replace('PREACHTITLE', convertUnicode(node.title));
            updateTextCb(string)

            if (ext === '.pro6') {
              textElement.attr('UUID').value(uuidv4().toUpperCase())
            }
					});
				} else {
					xmlSlide = verseSlide.clone();

					proParser.forEachSlideTexts(xmlSlide, function(textElement, string, updateTextCb) {
						debug('VERSE Text element: %s', string);

            if (ext === '.pro6') {
              textElement.attr('UUID').value(uuidv4().toUpperCase())
            }

						string = string.replace('BIBLEVERSE', node.verse.text);
						string = string.replace('VERSENUMBER', node.verse.number ? node.verse.number : '');
						string = string.replace('BIBLEREFERENCE', node.reference);
            updateTextCb(convertUnicode(string))
					});

					if (lastNode && node.reference != lastNode.reference) {
						highlightColorIndex = (highlightColorIndex + 1) % highlightColors.length;
					}

					xmlSlide.attr('highlightColor').value(highlightColors[highlightColorIndex]);
					lastNode = node;
				}

				xmlSlide.attr('UUID').value(uuidv4().toUpperCase())
				// xmlSlide.attr('sort_index').value(slideCount)
				// xmlSlide.attr('serialization-array-index').value(slideCount)

				var all = xmlDoc.find('//RVDisplaySlide');
				all[all.length - 1].addPrevSibling(xmlSlide);
			});

			verseSlide.remove()
      titleSlide.remove()

			return fs.writeFile(outputPath, xmlDoc.toString());
		})
		.then(function() {
			return outputPath;
		});
};

const Pro5 = {
  forEachSlideTexts (root, cb) {
    root.find('.//RVTextElement').forEach(function(textElement) {
      var attr = textElement.attr('RTFData');
      var rtfData = attr.value();
      var buffer = new Buffer(rtfData, 'base64');
      var string = buffer.toString('ascii');
      cb(textElement, string, (newString) => {
        attr.value(new Buffer(string).toString('base64'));
      });
    });
  }
}

const Pro6 = {
  forEachSlideTexts (root, cb) {
    root.find('.//RVTextElement').forEach(function(textElement) {
      const rtfElement = textElement.get('.//NSString') // [rvXMLIvarName=RTFData]
      const buffer = new Buffer(rtfElement.text(), 'base64');
      const string = buffer.toString('ascii');
      cb(textElement, string, (newString) => {
        rtfElement.text(new Buffer(newString).toString('base64'))
      });
    });
  }
}

function findParent(searchElement, startElement) {
  let node = startElement.parent()

  for (node = node.parent(); node.name() !== searchElement; ) {}

  return node
}

function convertUnicode(string) {
	var newString = '';

	_.forEach(string, function(char) {
		var charCode = char.charCodeAt(0);

		if (charCode > 127) {
			char = '\\u' + charCode + '?';
		}

		newString += char;
	});

	debug('Converted unicode string: %s', newString);

	return newString;
}
