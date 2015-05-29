'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var generate = require('./generator').generate;
var path = require('path');
var app = express();
var generatedDir = path.resolve(getEnv('GENERATED_DIR', 'generated')) + '/';
var templateDir = path.resolve(getEnv('TEMPLATE_DIR', 'template')) + '/';
var port = getEnv('PORT', 3000);

app.use(bodyParser.json());
app.use(express.static(path.resolve('www')));
app.use('/generated', express.static(generatedDir));
app.use('/lib', express.static(path.resolve('bower_components')));

app.post('/download', function(req, res) {
	generate(templateDir + 'preach.pro5', req.body, generatedDir)
		.then(function(path) {
			res.send({ url: path.replace(__dirname, '') });
		});
});

var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s', host, port);
});

function getEnv(key, defaultValue) {
	return process.env[key] ? process.env[key] : defaultValue;
}