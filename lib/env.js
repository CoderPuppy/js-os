define(['require', 'exports', './command'], function(require, exports, command) {
	var CommandRunner = command.CommandRunner;
	
	function clone(obj) {
		function F() {}
		F.prototype = obj;
		return new F();
	}
	
	exports.Enviorment = (function() {
		function Enviorment(globalEnviorment) {
			this.globalEnviorment = globalEnviorment || { vars: {} };
			this.commandRunner = new CommandRunner(this);
			
			this.vars = clone(this.globalEnviorment.vars);
		}
		
		Enviorment.prototype.runCMD = function runCMD(cmd) {
			return this.commandRunner.run(cmd);
		};
		
		return Enviorment
	})();
});
