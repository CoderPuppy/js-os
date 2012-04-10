define(['require', 'exports', './env'], function(require, exports, env) {
	var Enviorment = env.Enviorment;
	
	exports.Terminal = (function() {
		function Terminal(os) {
			this.env = new Enviorment(os.env);
		}
		
		Terminal.prototype.runCMD = function runCMD(cmd) {
			return this.env.runCMD(cmd);
		};
		
		return Terminal;
	})();
});
