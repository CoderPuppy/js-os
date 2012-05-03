define(['require', 'exports', './env', './terminal', './fs/index'], function(require, exports, env, terminal, fs) {
	var Terminal = terminal.Terminal; // Import Terminal
	var Environment = env.Environment; // and also Environment
	var Filesystem = fs.Filesystem; // we might need Filesystem
	
	var Session = exports.Session = (function() { // Session's start here
		function Session(user, level) { // or here: the user this is for and the level of permissions
			var self = this; // save this in self
			
			var __level = level; // internal level start's as level
			
			this.user = user; // save it's user
			
			this.machine = this.user.machine; // save the user's machine
			this.fs = new Filesystem(this.machine.fs.data); // and create a filesystem with the main data so then we can have different view point (current directory)
			
			this.env = new Environment(this.machine.env); // and create an environment to hold environment variables for this session only
			
			Object.defineProperties(this, { // define some properties
				level: { // let people get the level
					get: function() {
						return __level; // just return the level
					}
				}
			});
		}
		
		Session.prototype.terminal = function terminal(view) { // get a terminal
			return this._terminal || new Terminal(this, view); // keep only one
		};
		
		return Session;
	})();
});
