define(['require', 'exports', './stream'], function(require, exports, Stream) {
	var CMDContext = exports.CMDContext = (function() {
		function CMDContext(runContext, cmd, options) {
			this.runContext = runContext;
			this.cmd = cmd;
			this.options = options || {};
			this.invisible = !!this.options.invisible;
			this.pipe = !!options.pipe ? options.pipe : false;
			this.filePipes = options.filePipes || {};
			if(!this.invisible) this.view = this.runContext.view.createCMDView(this, this.cmd, { pipe: this.pipe });
			else this.view = { stream: new Stream() }
			
			this.data = new Stream();
			this.err  = new Stream();
			
			this.pipes = {};
			
			for(pipeName in this.filePipes) {
				this.pipes[pipeName] = new Stream();
			}
			
			this.fs = this.runContext.fs;
			this.env = this.runContext.env;
			this.terminal = this.runContext.terminal;
			
			this.exitCode = undefined;
			
			Object.defineProperties(this, {
				currentDir: {
					get: function() {
						return this.runContext.currentDir;
					},
					set: function(newDir) {
						this.runContext.currentDir = newDir;
					}
				}
			});
		}
		
		CMDContext.prototype.pipeTo = function pipeTo(dest) {
			this.data.pipe(dest.data);
			this.err.pipe(dest.data);
			
			return dest;
		};
		
		CMDContext.prototype.setExitCode = function setExitCode(code) {
			if(this.view && typeof(this.view.setExitCode) == 'function') this.view.setExitCode(code);
			this.exitCode = code;
			
			return this;
		};
		
		CMDContext.prototype.runCMD = function runCMD(cmd, cb) {
			return this.terminal.runCMD(cmd, cb);
		};
		
		return CMDContext;
	})();
});
