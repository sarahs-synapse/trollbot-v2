module.exports = {
	listener_port: 7181,
	listener_host_listen: '0.0.0.0',	
	listener_host: 'trollbot.org',	
	
	// This is so a client can authenticate with the listener to be authorized to hear
	// events as well as be able to issue commands
	shared_secret: "99c43b7f66d3cda9ab984772c3d62baa7bdc2ba3bb61229337354c0111625e68",

	network: {
		name: 'DALnet',
		nick: 'Discouragement',
		realname: 'Kicks the llama\'s ass.',
		ident: 'discourage',
		
		servers: [
			{
				hostname: "swiftco.dal.net",
				port: 6667
			}
		],
		
		channels: [
			'#coffee-talk',
			'#poutineworld',
			'#2600',
			'#php'
		]
	}
};
