define(function(require, exports, module) {
	var CMDContext = require('./cmdContext').CMDContext;
	
	function merge(dest, source) {
		for(key in source) {
			dest[key] = source[key];
		}
		
		return dest;
	}
	
	var RunContext = exports.RunContext = (function() {
		function RunContext(terminal, cmdLine, invisible) {
			this.cmdLine = cmdLine;
			this.terminal = terminal;
			this.invisible = invisible;
			if(!this.invisible) this.view = this.terminal.view.createRunView(this, this.cmdLine);
			
			this.fs = this.terminal.fs;
			this.env = this.terminal.env;
			
			this.cmdContexts = [];
		}
		
		RunContext.prototype.createCMDContext = function createCMDContext(cmd, options) {
			return this.cmdContexts[this.cmdContexts.push(new CMDContext(this, cmd, merge({ invisible: this.invisible }, options))) - 1];
		};
		
		return RunContext;
	})();
});
