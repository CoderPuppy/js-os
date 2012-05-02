define(['require', 'exports', './env', './terminal', './fs/index'], function(require, exports, env, terminal, fs) {
	var Terminal = terminal.Terminal;
	var Environment = env.Environment;
	var Filesystem = fs.Filesystem;
	
	var Session = exports.Session = (function() {
		function Session(user, level) {
			var self = this;
			
			var __level = level;
			
			this.user = user;
			
			this.machine = this.user.machine;
			this.fs = new Filesystem(this.machine.fs.data);
			
			this.env = new Environment(this.machine.env);
			
			Object.defineProperties(this, {
				level: {
					get: function() {
						return __level;
					}
				}
			});
		}
		
		Session.prototype.terminal = function terminal(view) {
			return this._terminal || new Terminal(this, view);
		};
		
		return Session;
	})();
});
