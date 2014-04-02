/**
 * TrollBot V2.0
 *
 * @author Benjamin Burkhart <benburkhart1@gmail.com>
 */
// Flow
// Get Configuration
var cfg = require('./config/config.js');

// Start socket layer
//var sl = require('./lib/ircsocketlayer.js');
//var layer = new sl(cfg.shared_secret, cfg.listener_port);
//layer.listen();

// Start bot layer after 1 second
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
		client.emit('client-write', "JOIN #foo\n");
		client.emit('get-network-info');

		// For each network, initiate a connection
//		client.emit('connect-irc-network', cfg.network);
	});

	client.on('network-info', function(network) {
		console.log('Client received network info');
		console.log(network);
	});

	client.on('irc-line', function(data) {
		console.log('client received irc line');
		console.log(data);
	});

	client.on('error', function(err) {
	});
}, 1000);
