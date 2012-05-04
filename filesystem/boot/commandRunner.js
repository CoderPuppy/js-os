define(function(require, exports, module) {
	var Command = require('./command').Command;
	var CommandParser = require('./commandParser').CommandParser;
	var EventEmitter = require('./events').EventEmitter;
	var PipeSequence = require('./pipeSeq').PipeSequence;
	
	var inherits = function(ctor, superCtor) {
	  ctor.super_ = superCtor;
	  ctor.prototype = Object.create(superCtor.prototype, {
		constructor: {
		  value: ctor,
		  enumerable: false,
		  writable: true,
		  configurable: true
		}
	  });
	};
	
	var merge = function merge(dest, source) {
		for(key in source) {
			dest[key] = source[key];
		}
		
		return dest;
	};
	
	var CommandRunner = exports.CommandRunner = (function() {
		function CommandRunner(terminal) {
			this.terminal = terminal;
			this.env = this.terminal.env;
			this.commandParser = new CommandParser(this.env);
			this.fs = this.terminal.fs;
			
			EventEmitter.call(this);
		}
		
		inherits(CommandRunner, EventEmitter);
		
		CommandRunner.prototype.run = function run(cmd, curDir, cb, /* internal */ sendMessage) {
			var cmdFiles, cmds, runContext, curPipeSeq, startSeq, allowRun, /*runCmd, pipes, tmpPipes, nextPipes, pipeList, toPipes,*/ rtnCode, self, i;
			
			self = this;
			cmds = this.commandParser.parse(cmd, function(cmdLine, env, execCmd) {
				var output = '';
				self.run(cmdLine, curDir, function(context) {
					context.data.on('data', function(d) {
						output += d;
					});
				}, false);
				
				return output;
			});
			/*cmdFiles = cmds.map(function(cmd) {
				return merge(cmd, { file: self.terminal.findCMD(cmd.args[0], curDir), args: cmd.args.slice(1), name: cmd.args[0] });
			});*/
			runContext = this.terminal.createRunContext(cmds, ( sendMessage === false ? true : false ));
			
			
			for(i = 0; i < cmds.length; i++) {
				curFile = cmds[i];
				
				if(curFile.joiner == '|') {
					if(!curPipeSeq) {
						curPipeSeq = new PipeSequence();
						curPipeSeq.push(cmds[i - 1]);
						startSeq = i - 1;
					}
					
					curPipeSeq.push(cmds[i]);
				} else if(curPipeSeq) {
					cmds.splice(startSeq, i - startSeq, curPipeSeq);
					curPipeSeq = undefined;
					startSeq = undefined;
				}
				
				if(!curPipeSeq) {
					cmds[i] = new Command(curFile, this.terminal, runContext).find();
				}
			}
			
			if(curPipeSeq) {
				cmds.splice(startSeq, cmds.length, curPipeSeq);
				curPipeSeq = undefined;
				startSeq = undefined;
			}
			
			//for(i = 0; i < cmdFiles.length; i++) {
			
			i = -1;
			
			function commandCallback(exitCode) {
				if(i + 1 < cmds.length) {
					allowRun = true;
				
					if(cmds[++i].joiner == '&&') allowRun = exitCode == 0;
					else if(cmds[i].joiner == '||') allowRun = exitCode != 0;
				
					if(allowRun) {
						//self.exec(cmds[i], undefined, undefined, runContext, commandCallback);
						/*(new Command(cmds[i], self.terminal, runContext)).find()*/cmds[i].exec(commandCallback, self.terminal, runContext);
					}
				} else {
					// Done
				}
			}
			
			commandCallback(0);
			
			/*	allowRun = true;
				
				if(cmdFiles[i].joiner == '&&') allowRun = rtnCode == 0;
				else if(cmdFiles[i].joiner == '||') allowRun = rtnCode != 0;
				
				if(allowRun) {
					rtnCode = this.exec(cmdFiles[i], undefined, undefined, runContext);
					
					this.env.vars['?'] = rtnCode; // Fixed #1
				}
			//}*/
			
//			return rtnCode;
		};
		
		CommandRunner.prototype.exec = function exec(obj, args, context, runContext, cb) {
			if(obj) {
				if(obj.file && this.fs.isExec(obj.file)) return this.execFile(obj.file, obj.args || args, context || runContext.createCMDContext(obj, {
					filePipes: obj.pipes || {}
				}), cb);
				else if(obj instanceof PipeSequence || typeof(obj.run) == 'function') return obj.run(this, runContext, args, context, cb); 
			}
		};
		
		CommandRunner.prototype.execFile = function execFile(file, args, context, cmdCb) {
			var exitCode = 0;
			
			function cb(exitCode) {
				exitCode = exitCode || 0;
				context.setExitCode(exitCode);
				if(typeof(cmdCb) == 'function') cmdCb(exitCode);
			}
			
			if(!this.fs.isExec(file)) return new Error("Not executable");
			
			try {
				if(file.command && typeof(file.command.exec) == 'function') {
					exitCode = file.command.exec(args, context, cb);
					
					// New code
					var source = new Function().toString.call(file.command.exec);
					
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
				} else if(file.contents && file.contents.length && file.contents.length > 0) {
					console.log('shell:', this.fs.pathTo(file), this.run(file.contents));
					cb(exitCode = 0);
				}
			} catch(e) {
				console.error('shell:', this.fs.pathTo(file), e, e.message, e.stack);
				cb(exitCode = 1);
			}
			
			context.setExitCode(exitCode || 0);
			
			return exitCode || 0;
		};
		
		return CommandRunner;
	})();
});
