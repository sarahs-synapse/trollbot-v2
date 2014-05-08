/**
 * This module deals with nickserv on
 * most used IRC networks.
 */
module.exports = function(client, nick, password) {
	var self = this;

	self.client   = client;
	self.nick     = nick;
	self.password = password;
	
	self.ghost = function() {
		self.client.emit('client-write', "NICKSERV GHOST " + self.nick + " " + self.password + "\n");
	}

	self.identify = function() {
		// FIXME: Check if nickname is current
		self.client.emit('client-write', "NICKSERV IDENTIFY " + self.password + "\n");
	}
}
