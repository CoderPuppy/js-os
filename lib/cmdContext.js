define(['require', 'exports', './stream'], function(require, exports, Stream) {
	var CMDContext = exports.CMDContext = (function() {
		function CMDContext(runContext, cmd, invisible) {
			this.runContext = runContext;
			this.cmd = cmd;
			this.invisible = invisible;
			if(!invisible) this.view = this.runContext.view.createCMDView(this, this.cmd);
			else this.view = { stream: new Stream() }
			
			this.data = new Stream();
			this.err  = new Stream();
		}
		
		CMDContext.prototype.pipeTo = function pipeTo(dest) {
			this.data.pipe(dest.data);
			this.err.pipe(dest.data);
		};
		
		return CMDContext;
	})();
});
