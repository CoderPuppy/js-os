define(['require', 'exports', './argument'], function(require, exports, argument) {
	var Argument = argument.Argument;
	
	var Command = exports.Command = (function() {
		function Command(cmd, terminal, runContext, options) {
			if(cmd instanceof arguments.callee) return cmd;
			
			this.cmd = cmd;
			
			var args = this.cmd.args;
			
			if(args[0] && args[0].length <= 0) {
				while(args[0] && args[0].length <= 0) {
					args.splice(0, 1);
				}
			}
			
			this.cmd.args = args;
			
			this.cmdName = this.cmd.args[0];
			this.args = this.cmd.args.slice(1);
			this.internalArgs = {};
			
			this.terminal = terminal;
			this.fs = this.terminal.fs;
			
			this.runContext = runContext;
			
			this.context = this.runContext.createCMDContext(this.cmd, (options || {}).context || {});
			
			if(!options || !options.parse) this.parseArgs();
		}
		
		Command.prototype.parseArgs = function parseArgs() {
			if(!this.file) this.find(); // If we don't have a file find one
			
			if(!this.file.command.params) return this; // No params
			
			var defs = this.file.command.params;
			var args = this.args;
			var internalArgs = this.internalArgs;
			
			defs.forEach(function(def, i) {
				internalArgs[def.name] = (new Argument(( typeof(def.type) == 'string' ? def.type : def.type.name ),
					( typeof(def.type) == 'object' ? def.type : {} )))
					.setInput(args[i]);
				args[def.name] = internalArgs[def.name].parse();
			});
			
			return this;
		};
		
		Command.prototype.find = function find() {
			var self = this;
			
			this.file = this.terminal.findCMD(this.cmdName) || {
				executable: true,
				command: {
					exec: function(arg, context) {
						context.view.stream.write('No such command: ' + self.cmdName);
					}
				}
			};
			
			return this;
		};
		
		Command.prototype.exec = function exec(cmdCb) {
			var exitCode = 0, self = this;
			
			function cb(exitCode) {
				exitCode = exitCode || 0;
				self.context.setExitCode(exitCode);
				if(typeof(cmdCb) == 'function') cmdCb(exitCode, this);
			}
			
			if(!this.file.executable) return new Error("Not executable");
			
			try {
				if(this.file.command && typeof(this.file.command.exec) == 'function') {
					exitCode = this.file.command.exec(this.args, this.context, cb);
					
					// New code
					var source = new Function().toString.call(this.file.command.exec);
					
					var called = false;
					
					var argMatch, callMatch;
					
					if(argMatch = /^\s*function\s*(?:[\w\$_][\w\d]*)?\s*\([\w\$\_][\w\d]*\,\s*[\w\$\_][\w\d]*\,\s*([\w\$\_][\w\d]*)\)\s*{/.exec(source)) {
						// Basic search for it being called
						called = !!(callMatch = new RegExp(RegExp.escape(argMatch[1]) + '\\s*\\(').exec(source));
					}
					
					if(!called) {
						// Call the callback if the command does not call it
						cb(exitCode);
					}
					// End new code
				} else if(this.file.contents && this.file.contents.length && this.file.contents.length > 0) {
					console.log('shell:', this.fs.pathTo(file), this.run(file.contents));
					cb(exitCode = 0);
				}
			} catch(e) {
				console.error('error:', this.fs.pathTo(this.file), e, e.message, e.stack);
				cb(exitCode = 1);
			}
			
			this.context.setExitCode(exitCode || 0);
			
			return exitCode || 0;
		};
		
		return Command;
	})();
});
