/**
 * Core IRC layer
 * 
 * This is the trollbot IRC core layer. This is a really
 * slim sliver of functionality needed to provide the bot
 * with the capabilities needed by external scripts. It
 * should be edited the least in the project, and should
 * be little more than a socket layer to facilitate logic
 * changes without restarts.
 */
module.exports = function(cfg, secret, port) {
	var self = this;

	self.cfg = cfg;
	self.port = (typeof port == undefined) ? 61362 : port;
	self.listener_sock = false;
	self.shared_secret = secret;
	self.sio		   = require('socket.io');
	self.net		   = require('net');

	self.client;

	//self.modules = {};

	self.active_clients = [];
	self.network_socket = false;

	self.network = false;

	self.active_server_index = 0;
	self.keepAliveInterval = 0;
	self.keepAliveLast = 0;


	/**
	 * This just sends messages to everyone connected
	 * to the listener.
	 *
	 * @param cmd The command to send to all clients
	 * @param data the payload to send to all clients
	 */
	self.emitClients = function(cmd, data) {
		self.active_clients.forEach(function(sock) { 
			// Only if they're authenticated
			if (sock.authenticated == true)
				sock.socket.emit(cmd, data);
		});
	}

	self.connectToServer = function(hostname, port) {
		return self.net.connect(port, hostname);
	}

	self.cycleServer = function() {
		// go on to the next server
		if (typeof network.servers[self.active_server_index+1] == 'undefined')
			self.active_server_index = 0;
		else
			self.active_server_index++;
	}

	self.connect = function(network, firstTime) {
		if (firstTime)
		{
			self.cycleServer();
		}

		self.client = self.connectToServer(network.servers[self.active_server_index].hostname, network.servers[self.active_server_index].port);

		if (self.keepAliveInterval)
			clearInterval(self.keepAliveInterval);			

		self.keepAliveInterval = setInterval(function() {
			self.client.write("PING foo\n");
		}, 20000);

		self.setupServer(self.client, network);
	}

	self.setupServer = function(client, network) {
		client.setEncoding('utf8');

		var data = '';
		var authenticated = false;

		client.on('error', function(err) {
			console.log(err);
		});
		client.on('close', function(is_error) {
			console.log('Server lost connection');
			// This reconnects after 3 seconds
			setTimeout(function() {
				console.log("Reconnecting");
				self.connect(network, false);
			}, 3000);
		});

		client.on('error', function(err) {
			console.log(err);
		});
		client.on('data', function(chunk) {
			if (authenticated == false)
			{
				// Send USER <username> <hostname> <servername> <realname>
					if (typeof network.password != 'undefined')
					{
						client.write('PASS ' + network.password + "\n");
					}
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
				}
				else if (first_two[0] == 'PONG')
				{
					self.keepAliveLast = (new Date()).getTime();
				}

				self.emitClients('irc-line', line);	
			}
		});

		self.network_socket = client;
		self.network        = network;

		self.keepAliveLast = (new Date()).getTime();

		// Dead server alert
		setInterval(function() {
			if (self.keepAliveLast)
			{
				if (((new Date()).getTime() - self.keepAliveLast) > (10*60*1000))
				{
					console.log("Detected stoned server, exiting with error to restart");
					// Do this so I don't accdientally disconnect the next connection before it finishes
					self.keepAliveLast = (new Date()).getTime();

					setTimeout(function() {
						console.log("Reconnecting");
						self.connect(network, false);
					}, 3000);
				}
			}
		},10000);
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
	
				self.connect(network, false);

				if (self.network)
					socket.emit('network-info', self.network);
			});

/*
			socket.on('unload-module', function(module) {
				if (sck.authenticated == false)
					return false;

				// Unload the old one
				if (self.modules[module])
				{
					console.log("Unloading " + module);
					self.modules[module].unload();	
					delete self.modules[module];
				}
			});


			socket.on('load-module', function(module) {
				if (sck.authenticated == false)
					return false;

				// Unload the old one
				if (self.modules[module])
				{
					console.log("Unloading " + module);
					self.modules[module].unload();	
					delete self.modules[module];
					delete require.cache[self.cfg.module_directory+'/'+module+'.js'];
				}

				try
				{
					console.log("Loading " + module);

					var moo = require(self.cfg.module_directory+'/'+module+'.js');
					self.modules[module] = new moo(self.cfg);
				
					if (self.modules[module].load)
						self.modules[module].load();
				}
				catch (e) {
					console.log("Error loading Module :", e);
				}
			});
*/
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

			socket.on('broadcast', function(pkt) {
				console.log('Received broadcast ', pkt);
				if (sck.authenticated == false)
					return false;


				self.emitClients(pkt.event, pkt.data);
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
