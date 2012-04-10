define(['require', 'exports', './command'], function(require, exports, command) {
	var CommandRunner = command.CommandRunner;
	
	exports.Enviorment = (function() {
		function Enviorment() {
			this.commandRunner = new CommandRunner();
		}
		
		Enviorment.prototype.runCMD = function runCMD(cmd) {
			return this.commandRunner.run(cmd);
		};
		
		return Enviorment
	});
});
