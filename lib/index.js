define(['require', 'exports', './terminal', './env', './fs/index'], function(require, exports, terminal, env, fs) {
	var Terminal = exports.Terminal = terminal.Terminal;
	var Enviorment = exports.Enviorment = env.Enviorment;
	var Filesystem = exports.Filesystem = fs.Filesystem;
	
	exports.OS = (function() {
		function OS() {
			this.env = new Enviorment();
			this.fs = new Filesystem();
		}
		
		OS.prototype.createTerminal = function createTerminal() {
			return new Terminal(this);
		};
		
		return OS;
	})();
});
