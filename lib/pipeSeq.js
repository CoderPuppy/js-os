define(['require', 'exports'], function(require, exports) {
	var PipeSequence = exports.PipeSequence = (function() {
		function PipeSequence() {
			this.cmds = [];
		}
		
		PipeSequence.prototype.push = function push(cmd) {
			this.cmds.push(cmd);
		};
		
		PipeSequence.prototype.run = function run(commandRunner, runContext) {
			var tmpRtnCode, toContext, rtnCode = 0, i;
			
			for(i = this.cmds.length - 1; i >= 0; i--) {
				var context = runContext.createCMDContext(this.cmds[i], { pipe: ( i == this.cmds.length - 1 ? 'first' : 'later' ), filePipes: this.cmds[i].pipes || {} });
				
				if(toContext) context.pipeTo(toContext); // Pipe every thing to the end context if this is not the first command
				
				if(!toContext) toContext = context;
				
				tmpRtnCode = commandRunner.exec(this.cmds[i], undefined, context);
				rntCode = tmpRtnCode == 0 ? rtnCode : tmpRtnCode;
			}
			
			return rtnCode;
		};
		
		return PipeSequence;
	})();
});
