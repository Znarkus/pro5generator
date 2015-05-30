// flightplan.js
var plan = require('flightplan');

plan.target('production', [
	{
		host: 'z.markushedlund.se',
		username: 'markus',
		agent: process.env.SSH_AUTH_SOCK
	}
]);

var tmpDir = 'pro5gen-' + new Date().getTime();
var deployBasePath = '~/pro5gen/';
var currentPath = deployBasePath + 'current';
var latestPath = deployBasePath + tmpDir;

// run commands on localhost
plan.local(function(local) {
	local.log('Copy files to remote hosts');
	var filesToCopy = local.exec('git ls-files', {silent: true});
	// rsync files to all the target's remote hosts
	local.transfer(filesToCopy, '/tmp/' + tmpDir);
});

// run commands on the target's remote hosts
plan.remote(function(remote) {
	remote.log('Move folder to web root');
	remote.cp('-R /tmp/' + tmpDir + ' ' + latestPath);
	remote.rm('-rf /tmp/' + tmpDir);

	remote.log('Install dependencies');
	
	remote.with('cd ' + latestPath, function() {
		remote.exec('npm --production install');
		remote.exec('bower i');
	});


	remote.log('Reload application');
	remote.ln('-snf ' + latestPath + ' ' + currentPath);

	remote.with('cd ' + deployBasePath, function() {
		remote.exec('forever restart current');
	});
});