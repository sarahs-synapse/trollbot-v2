var cfg  = require('./bootstrap-cli.js').config;
var irc  = require('./lib/irc.js');
var ChanLib = require('./lib/channels.js');


console.log("Trollbot V2");
console.log("-----------");

console.log('Starting Core Layer.');

// Start core layer
var core  = require('./lib/core.js');
var tb    = new core(cfg.shared_secret, cfg.listener_port);
tb.listen();

console.log('Waiting 1 second to initiate network connection to Trollbot v2 server.');

setTimeout(function() {
	var tbc  = require('trollbot-v2-client');

	var tclient = new tbc(cfg.listener_host, cfg.listener_port, cfg.shared_secret);

	tclient.getTSock(function(err, client) {
		client.emit('connect-irc-network', cfg.network); 

		client.on('irc-line', function(data) {
			var pkt = irc.parseLine(data);

			switch (pkt.command)
			{
				// 376 - end of MOTD
				case '376':
					// Going to go ahead and join all channels at the end of the MOTD
					var chan = new ChanLib(client);
					
					cfg.network.channels.forEach(function(channel) { 
						chan.join(channel);
					});

					break;
				// Message, to the bot or a channel
				case 'PRIVMSG':
					// Check 2 bytes before going down this route
					if (irc.isCtcp(pkt.rest))
					{
						var ctcp = irc.parseCtcp(pkt.rest);
						switch (ctcp.ctcp)
						{
							case 'VERSION':
								client.emit('client-write', "NOTICE " + pkt.prefix.nickname + " :\001VERSION TrollBot V2.0 http://www.trollbot.org - Written in Node.JS!\001\n");
								break;
						}
						console.log('CTCP WAS ', ctcp);
					}
					break;
				// Either another person joined a channel, or the bot did
				case 'JOIN':
					// If it's another person
					// If it's the bot
					break;
			}
		});
	});
}, 1000);
