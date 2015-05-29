'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var generate = require('./generator').generate;
var app = express();

app.use(bodyParser.json());
app.use(express.static('www'));
app.use('/generated', express.static('generated'));
app.use('/lib', express.static('bower_components'));

app.post('/download', function(req, res) {
	generate(req.body, 'generated/')
		.then(function(path) {
			res.send({ url: '/' + path });
		});
});

var server = app.listen(3000, function () {

	var host = server.address().address;
	var port = server.address().port;

	console.log('Server listening at http://%s:%s', host, port);
});
