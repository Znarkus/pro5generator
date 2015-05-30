'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var generate = require('./generator').generate;
var Path = require('path');
var app = express();
var generatedDir = Path.resolve(getEnv('GENERATED_DIR', __dirname + '/generated')) + '/';
var templateDir = Path.resolve(getEnv('TEMPLATE_DIR', __dirname + '/template')) + '/';
var port = getEnv('PORT', 3000);

app.use(bodyParser.json());
app.use(express.static(Path.resolve(__dirname, 'www')));
app.use('/generated', express.static(generatedDir));
app.use('/lib', express.static(Path.resolve(__dirname, 'bower_components')));

app.post('/download', function(req, res) {
	generate(templateDir + 'preach.pro5', req.body, generatedDir)
		.then(function(path) {
			res.send({ url: '/generated/' + Path.basename(path) });
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