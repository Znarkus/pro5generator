'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var generate = require('./generator').generate;
var Path = require('path');
var mkdirp = require('mkdirp');
var glob = require('glob')
var app = express();
var accountBaseDir = Path.resolve(getEnv('ACCOUNT_DIR', __dirname + '/account')) + '/';
//var templateDir = accountDir +  //Path.resolve(getEnv('TEMPLATE_DIR', __dirname + '/template')) + '/';
var port = getEnv('PORT', 3000);

// Create generated dir
glob(Path.resolve(accountBaseDir, '*'), function(err, dirs) {
	_.forEach(dirs, function(dir) {
		mkdirp(Path.resolve(dir, 'generated'));
	});
});

// Init
app.use(bodyParser.json());
app.use(express.static(Path.resolve(__dirname, 'www')));
app.use('/account', express.static(accountBaseDir));
app.use('/lib', express.static(Path.resolve(__dirname, 'bower_components')));
app.use(function(req, res, next) {
	req.account = Path.basename(req.body.account ? req.body.account : req.query.account);
	req.template = Path.basename(req.body.template ? req.body.template : req.query.template);
	req.accountDir = Path.resolve(accountBaseDir, req.account);
	next();
});

// Routes
app.get('/template', function(req, res) {
	if (!req.accountDir) {
		return res.status(400).end();
	}

	glob(Path.resolve(req.accountDir, '*.pro5'), function(err, files) {
		res.send(files.map(Path.basename));
	});
});

app.post('/download', function(req, res) {
	if (!req.account || !req.template || !req.accountDir || !req.body.parsed) {
		return res.status(400).end();
	}

	generate(
		Path.resolve(req.accountDir, req.template),
		req.body.parsed,
		Path.resolve(req.accountDir, 'generated')
	).then(function(path) {
		res.send({ url: '/account/' + req.account + '/generated/' + Path.basename(path) });
	});
});

// Boot
var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Server listening at http://%s:%s', host, port);
});

///////////////////////////
function getEnv(key, defaultValue) {
	return process.env[key] ? process.env[key] : defaultValue;
}