define(['require', 'exports', './env'], function(require, exports, env) {
	var Enviorment = env.Enviorment;
	
	exports.Terminal = (function() {
		function Terminal() {
			this.env = new Enviorment();
		}
		
		Terminal.prototype.runCMD = function runCMD(cmd) {
			this.env.runCMD(cmd);
		};
		
		return Terminal;
	})();
});
