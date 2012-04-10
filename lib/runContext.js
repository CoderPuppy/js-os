define(['require', 'exports', './cmdContext'], function(require, exports, cmdContext) {
	var CMDContext = cmdContext.CMDContext;
	
	var RunContext = exports.RunContext = (function() {
		function RunContext(view, cmdLine) {
			this.cmdLine = cmdLine;
			this.view = view.createRunView(this, cmdLine);
		}
		
		RunContext.prototype.createCMDContext = function createCMDContext(cmd) {
			return new CMDContext(this, cmd);
		};
		
		return RunContext;
	})();
});
