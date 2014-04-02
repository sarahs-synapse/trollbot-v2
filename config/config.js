module.exports = {
	listener_port: 7181,
	listener_host_listen: '0.0.0.0',	
	listener_host: '127.0.0.1',	
	
	// This is so a client can authenticate with the listener to be authorized to hear
	// events as well as be able to issue commands
	shared_secret: "99c43b7f66d3cda9ab984772c3d62baa7bdc2ba3bb61229337354c0111625e68",

	network: {
		name: 'local net',
		nick: 'nodebotv2',
		realname: 'Node.JS Bot SocketLayer',
		ident: 'nodebot',
		
		servers: [
			{
				hostname: "127.0.0.1",
				port: 6667
			}
		]
	}
};
