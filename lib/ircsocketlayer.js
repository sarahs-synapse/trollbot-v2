/**
 * IRC Socket Layer
 * 
 * This is the trollbot IRC socket layer. This allows for the
 * portion of the IRC bot which connects to the IRCD to be
 * separate from the rest of the bot. This ensures that
 * 
 * 1) IRC logic crashes do not cause the bot to disconnect.
 * 2) Multiple "bots" can connect through 1 bots interface.
 * 3) Centralized management of queuing text.
 *
 */
module.exports = function(secret, port) {
	var self = this;

	self.port = (typeof port == undefined) ? 61362 : port;
	self.listener_sock = false;
	self.shared_secret = secret;
	self.sio		   = require('socket.io');
	self.net		   = require('net');

	self.active_clients = [];
	self.network_socket = false;

	self.network = false;


	/**
	 * This just sends messages to everyone connected
	 * to the listener.
	 *
	 * @param cmd The command to send to all clients
	 * @param data the payload to send to all clients
	 */
	self.emitClients = function(cmd, data) {
		self.active_clients.forEach(function(sock) { 
			sock.socket.emit(cmd, data);
		});
	}

	/**
	 * This starts the listener so clients can interact
	 * with the socket layer
	 *
	 */
	self.listen = function() {
		var io = self.sio.listen(parseInt(self.port));

		io.sockets.on('connection', function (socket) {
			console.log('Incoming connection.');

			var sck = {
				name: false,
				type: 'client',
				socket: socket,
				real_servername: false,
				authenticated: false
			};

			self.active_clients.push(sck);

			socket.on('connect-irc-network', function(network) {
				if (sck.authenticated == false)
					return false;

				console.log('Connecting to IRC network');

				// First off ensure they we're not already connected to this network.
				// if socket already is connected then ...
				if (self.network_socket != false)
					return true;
				
				var client = self.net.connect(network.servers[0].port, network.servers[0].hostname);
				self.network_socket = client;
				self.network        = network;

				if (self.network)
					socket.emit('network-info', self.network);

				client.setEncoding('utf8');

				var data = '';
				var authenticated = false;

				client.on('data', function(chunk) {
					if (authenticated == false)
					{
						// Send USER <username> <hostname> <servername> <realname>
							client.write('USER ' + network.ident + ' 0 0 :' + network.realname + "\n");
							client.write('NICK ' + network.nick + "\n");
							authenticated = true;
					}

					data += chunk;	

					// if the trailing part of chunk has CRLF, then split them all
					var lines	= data.split("\n");

					// skip the last line if it's not complete
					if (data.charAt(data.length-1) != "\n")
					{
						data = lines.pop();
					}
					else
						data = '';
					
					for (var i = 0; i < lines.length-1; i++)
					{
						var line = (lines[i].split('\r',1))[0];

						// Handle PING
						var first_two = line.split(' ', 2);
						if (first_two[0] == 'PING')
						{
							client.write('PONG ' + first_two[1] + "\n");
							console.log('PONG');
						}
		
						self.emitClients('irc-line', line);	
					}
				});
			});

			socket.on('get-network-info', function() {
				if (sck.authenticated == false)
					return false;

				socket.emit('network-info', self.network);
			});

			socket.on('client-write', function(data) {
				if (sck.authenticated == false)
					return false;

				if (self.network_socket)
					self.network_socket.write(data);	
			});

			socket.on('client-connect', function(data) {
				console.log('Fired off connected event');
			
				// Check shared secret
				console.log('Checking shared secret');
		
				if (data.shared_secret != self.shared_secret)
				{
					console.log('shared secret was wrong!');
					socket.disconnect('unauthorized');
					return;
				}

				console.log('shared secret was right');

				// Mark socket as authenticated
				sck.authenticated = true;

				// Spill out our config
				if (self.network)
					socket.emit('network-info', self.network);
			});

			socket.on('disconnect', function (data, blah) {
					console.log('User Disconnected');
					console.log(data);
					console.log(blah);
			});
		});
	}
}
