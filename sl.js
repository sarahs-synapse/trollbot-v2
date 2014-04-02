var cfg = require('./config/config.js');

// Start socket layer
var sl = require('./lib/ircsocketlayer.js');
var layer = new sl(cfg.shared_secret, cfg.listener_port);
layer.listen();
