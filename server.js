(function () {

	var express = require('express');
	var compression = require('compression');
	var app = express();

	var yargs = require('yargs').options({
		'port': {
			'default': 3000,
			'description': 'Port to listen on.'
		},
		'public': {
			'type': 'boolean',
			'description': 'Run a public server that listens on all interfaces.'
		},
		'upstream-proxy': {
			'description': 'A standard proxy server that will be used to retrieve data.  Specify a URL including port, e.g. "http://proxy:8000".'
		},
		'bypass-upstream-proxy-hosts': {
			'description': 'A comma separated list of hosts that will bypass the specified upstream_proxy, e.g. "lanhost1,lanhost2"'
		},
		'help': {
			'alias': 'h',
			'type': 'boolean',
			'description': 'Show this help.'
		}
	});
	var argv = yargs.argv;

	if (argv.help) {
		return yargs.showHelp();
	}

	app.use(compression());
	app.use(function (req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		next();
	});
	app.use(express.static(__dirname));

	var server = app.listen(argv.port, function () {
		var host = server.address().address;
		var port = server.address().port;

		console.log('listen at http://127.0.0.1:%s',port);
	});

	server.on('close', function () {
		console.log('closed');
	});
})();