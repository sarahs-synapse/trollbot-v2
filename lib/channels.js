/**
 * Channels module.
 *
 * This module ensures that the bot is in
 * the channels desired. It will rejoin 
 * channels if configured/wanted.
 *
 */
module.exports = function(client) {
	var self = this;

	self.currentChannels = [];
	/**
	 * Simply joins a single channel.
	 */
	self.join = function(channel) {
		client.emit('client-write', "JOIN " + channel + "\n");
	}

	

}
