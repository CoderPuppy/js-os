define(['require', 'exports'], function(require, exports) {
	var PipeSequence = exports.PipeSequence = (function() {
		function PipeSequence() {
			this.cmds = [];
		}
		
		PipeSequence.prototype.push = function push(cmd) {
			this.cmds.push(cmd);
		};
		
		PipeSequence.prototype.run = function run(commandRunner, runContext) {
			var toContext, rtnCode, i;
			
			for(i = this.cmds.length - 1; i >= 0; i--) {
				var context = runContext.createCMDContext(this.cmds[i], { pipe: ( i == this.cmds.length - 1 ? 'first' : 'later' ) });
				
				if(toContext) context.pipeTo(toContext); // Pipe every thing to the end context if this is not the first command
				
				if(!toContext) toContext = context;
				
				commandRunner.exec(this.cmds[i], undefined, context);
			}
			
			return rtnCode;
		};
		
		return PipeSequence;
	})();
});
