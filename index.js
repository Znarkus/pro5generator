'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var generate = require('./lib/generator').generate;
var Path = require('path');
var mkdirp = require('mkdirp');
var glob = require('glob');
var AWS = require('aws-sdk');
const fs = require('fs')
const os = require('os')

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  region: process.env.AWS_S3_REGION,
  params: { Bucket: process.env.AWS_S3_BUCKET }
});

var app = express();

const supportedTemplateExt = [
  '.pro5',
  '.pro6',
]

var port = getEnv('PORT', 3000);

// Init
mkdirp('generated')
app.use(bodyParser.json());
app.use(express.static(Path.resolve(__dirname, 'www')));
app.use('/generated', express.static('generated'));
app.use('/lib', express.static(Path.resolve(__dirname, 'bower_components')));
app.use(function(req, res, next) {
	if (req.body.account || req.query.account) {
		req.account = Path.basename(req.body.account ? req.body.account : req.query.account);
	}

	if (req.body.template || req.query.template) {
		req.template = Path.basename(req.body.template ? req.body.template : req.query.template);
		req.templateExt = Path.extname(req.template)

    if (!supportedTemplateExt.includes(req.templateExt)) {
      return res.status(400).end();
    }
	}

	next();
});

// Routes
app.get('/template', async (req, res) => {
  const files = await s3.listObjectsV2({
    Prefix: `${req.account}/`
  }).promise()

  res.send(files.Contents
    .filter(f => supportedTemplateExt.includes(Path.extname(f.Key)))
    .map(f => Path.basename(f.Key))
  )
});

app.post('/download', async (req, res) => {
	if (!req.account || !req.template || !req.body.parsed) {
		return res.status(400).end();
	}

	const templatePath = `${os.tmpdir()}/${new Date().getTime()}${req.templateExt}`

  const file = fs.createWriteStream(templatePath);

	await new Promise((resolve, reject) => {
    s3
      .getObject({ Key: `${req.account}/${req.template}` })
      .createReadStream()
      .on('end', () => {
        return resolve()
      })
      .on('error', (error) => {
        return reject(error)
      })
      .pipe(file)
  })

	generate(
		templatePath,
		req.body.parsed,
		'generated'
	).then(function(path) {
		res.send({ url: '/generated/' + Path.basename(path) });
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
