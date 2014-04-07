/**
 * Trollbot V2
 *
 * An IRC bot.
 */
if (process.argv.length != 3)
{
	console.log('Syntax:');
	console.log(process.argv[0] + ' ' + process.argv[1] + ' <network>');
	process.exit(1);
}

console.log("Trollbot V2");
console.log("-----------");

var cfg = require('./config/' + process.argv[2] + '.js');

// Start socket layer
var sl = require('./lib/ircsocketlayer.js');
var layer = new sl(cfg.shared_secret, cfg.listener_port);
layer.listen();

setTimeout(function() {
	var sio = require('socket.io-client');

	var client = sio.connect('tcp://' + cfg.listener_host + ':' + cfg.listener_port, function( err ) {
		if (err)
			console.log(err);
	});

	client.on('connect', function() {
		// TODO: Identify this client
		console.log('Connected to server');
		client.emit('client-connect', { shared_secret: cfg.shared_secret });

		// For each network, initiate a connection
		client.emit('connect-irc-network', cfg.network);

		// We no longer need this connection
		client.disconnect();
	});

	client.on('network-info', function(network) {
		console.log('Client received network info');
		console.log(network);
	});

	client.on('error', function(err) {
	});
}, 1000);
