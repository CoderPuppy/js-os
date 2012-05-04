define(function(require, exports, module) {
	var Command = require('./command').Command;
	
	var PipeSequence = exports.PipeSequence = (function() {
		function PipeSequence(terminal) {
			this.cmds = [];
		}
		
		PipeSequence.prototype.push = function push(cmd) {
			this.cmds.push(cmd);
		};
		
		PipeSequence.prototype.exec = function exec(cmdCb, terminal, runContext) {
			var tmpRtnCode, toContext, rtnCode = 0, i;
			
			for(i = this.cmds.length - 1; i >= 0; i--) {
				var command = new Command(this.cmds[i], terminal, runContext, { context: { pipe: ( i == this.cmds.length - 1 ? 'first' : 'later' ), filePipes: this.cmds[i].pipes || {} } }).find();
				
				if(toContext) command.context.pipeTo(toContext); // Pipe every thing to the end context if this is not the first command
				
				if(!toContext) toContext = command.context;
				
				tmpRtnCode = command.exec(function(exitCode, cmd) {
					if(exitCode != 0) rtnCode = exitCode;
				}, terminal, runContext);
				
				rntCode = tmpRtnCode == 0 ? rtnCode : tmpRtnCode;
			}
			
			cmdCb(rtnCode);
			
			return rtnCode;
		};
		
		return PipeSequence;
	})();
});
