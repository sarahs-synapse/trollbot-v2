/**
 * TrollBot V2.0
 *
 */
// Flow
// Get Configuration
var cfg = require('./config/config.js');
var irc = require('./lib/irc.js');

var sio = require('socket.io-client');

var client = sio.connect('tcp://' + cfg.listener_host + ':' + cfg.listener_port, function( err ) {
	if (err)
		console.log(err);
});

client.on('connect', function() {
	// TODO: Identify this client
	console.log('Connected to server');
	client.emit('client-connect', { shared_secret: cfg.shared_secret });
});

client.on('network-info', function(network) {
	console.log('Client received network info');
	console.log(network);
});

client.on('irc-line', function(data) {
	console.log('client received irc line');
	var dat = irc.parseLine(data);

	if (dat.command == 'PRIVMSG')
	{
		var words = dat.rest.split(" ");

		if (words[0] == '!eatshit')
		{
			console.log('received wee');
			client.emit('client-write', "PRIVMSG " + dat.command_parameters[0] + " :" + dat.prefix.nickname + ", you eat shit.\n");
		}
	}
});

client.on('error', function(err) {
});
