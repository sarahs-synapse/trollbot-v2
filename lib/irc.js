/**
 * This is the IRC layer. This parses out raw lines
 * into associated data structures.
 * 
 */
module.exports = {
	self: this,
	parseLine: function(line) {
		var ret = { };

		var words = line.split(" ");

		// Prefix parsing
		if (line.charAt(0) == ':')
		{
			var prefix = { };

			// If there's no '!' in it, it's a server name, not a uhost
			if (words[0].indexOf("!") == -1)
			{
				prefix.server = words[0].substring(1);
			}
			else
			{
				// It's a uhost in nick!user@host format
				prefix.nickname = words[0].substring(1).split("!")[0];
				prefix.username = words[0].split("!")[1].split("@")[0];
				prefix.hostname = words[0].split("@")[1];
			}

			ret.prefix = prefix;
		}

		// Command, the command is the first word after the prefix
		// it has optional parameters
		ret.command = words[1];

		ret.command_parameters = [];

		var index;
		for (index = 2; index < words.length; index++)
		{
			if (words[index].charAt(0) != ':')
			{
				// This word is a command parameter
				ret.command_parameters.push(words[index]);
			}
			else
				break; // we use index later
		}

		// Ok I'm just going to do something ugly but it feels ok
		// I count the length of all words up until this point, and add
		// 1 to pass the ':' and the rest is what's important
		var cnt = 0;
		for (var i = 0; i < index; i++)
		{
			cnt += words[i].length + 1;
		}
	
		ret.rest = line.substring(cnt+1);
		ret.rest_words = ret.rest.split(" ");

		return ret;
	}
}
