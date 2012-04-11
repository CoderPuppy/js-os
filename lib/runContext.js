define(['require', 'exports', './cmdContext'], function(require, exports, cmdContext) {
	var CMDContext = cmdContext.CMDContext;
	
	var RunContext = exports.RunContext = (function() {
		function RunContext(terminal, cmdLine, invisible) {
			this.cmdLine = cmdLine;
			this.terminal = terminal;
			this.invisible = invisible;
			if(!this.invisible) this.view = this.terminal.view.createRunView(this, cmdLine);
		}
		
		RunContext.prototype.createCMDContext = function createCMDContext(cmd) {
			return new CMDContext(this, cmd, this.invisible);
		};
		
		return RunContext;
	})();
});
