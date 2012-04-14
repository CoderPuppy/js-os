define(['require', 'exports', './cli-parser/js/parser.js', './stream', './events', './pipeSeq'], function(require, exports, cliParser, Stream, events, pipeSeq) {
	var PipeSequence = pipeSeq.PipeSequence;
	var CLIParser = cliParser.Parser;
	var EventEmitter = events.EventEmitter;
	
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
		
		CommandRunner.prototype.pipeTo = function pipeTo(from, to) {
			for(pipeName in from) {
				if(to[pipeName] && from[pipeName]) {
					from[pipeName].pipe(to[pipeName]);
				}
			}
		};
		
		CommandRunner.prototype.run = function run(cmd, curDir, cb, /* internal */ sendMessage) {
			var cmdFiles, cmds, runContext, curPipeSeq, startSeq, allowRun, /*runCmd, pipes, tmpPipes, nextPipes, pipeList, toPipes,*/ rtnCode, self;
			
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
			cmdFiles = cmds.map(function(cmd) {
				return merge(cmd, { file: self.terminal.findCMD(cmd.args[0], curDir), args: cmd.args.slice(1), name: cmd.args[0] });
			});
			runContext = this.terminal.createRunContext(cmdFiles, ( sendMessage === false ? true : false ));
			
			
			for(i = 0; i < cmdFiles.length; i++) {
				curFile = cmdFiles[i];
				
				if(curFile.joiner == '|') {
					if(!curPipeSeq) {
						curPipeSeq = new PipeSequence();
						curPipeSeq.push(cmdFiles[i - 1]);
						startSeq = i - 1;
					}
					
					curPipeSeq.push(curFile);
				} else if(curPipeSeq) {
					cmdFiles.splice(startSeq, i - startSeq, curPipeSeq);
					curPipeSeq = undefined;
					startSeq = undefined;
				}
			}
			
			if(curPipeSeq) {
				cmdFiles.splice(startSeq, cmdFiles.length, curPipeSeq);
				curPipeSeq = undefined;
				startSeq = undefined;
			}
			
			for(i = 0; i < cmdFiles.length; i++) {
				allowRun = true;
				
				if(cmdFiles[i].joiner == '&&') allowRun = rtnCode == 0;
				else if(cmdFiles[i].joiner == '||') allowRun = rtnCode != 0;
				
				if(allowRun) {
					rtnCode = this.exec(cmdFiles[i], undefined, undefined, runContext);
					
					this.env.vars['?'] = rtnCode; // Fixed #1
				}
			}
			
			return rtnCode;
		};
		
		CommandRunner.prototype.exec = function exec(obj, args, context, runContext) {
			if(obj) {
				if(obj.file && this.fs.isExec(obj.file)) return this.execFile(obj.file, obj.args || args, context || runContext.createCMDContext(obj, { filePipes: obj.pipes || {} }));
				else if(obj instanceof PipeSequence || typeof(obj.run) == 'function') return obj.run(this, runContext, args, context); 
			}
		};
		
		CommandRunner.prototype.execFile = function execFile(file, args, context) {
			var exitCode = 0;
			
			if(!this.fs.isExec(file)) return new Error("Not executable");
			
			try {
				if(file.command && typeof(file.command.exec) == 'function') {
					exitCode = file.command.exec(args, context);
				} else if(file.contents && file.contents.length && file.contents.length > 0) {
					console.log('shell:', this.fs.pathTo(file), this.run(file.contents));
					exitCode = 0;
				}
			} catch(e) {
				console.error('shell:', this.fs.pathTo(file), e, e.message, e.stack);
				exitCode = 1;
			}
			
			context.setExitCode(exitCode || 0);
			
			return exitCode || 0;
		};
		
		return CommandRunner;
	})();
	
	var CommandParser = exports.CommandParser = (function() {
		function CommandParser(env) {
			this.env = env;
			this.cliParser = new CLIParser();
		}
		
		CommandParser.prototype.parseFileStreams = function parseFileStreams(cmd) {
			var str, pipes, chars, curChar;
			
			pipes = {};
			chars = cmd.split('');
			
			/*function replaceCommands(str, pipes) {
				cmd.replace(/(\\\\|[^\\])(([\>\<])?([12])?([\>\<])\s*([\w\d\.\$]+))/g, function($A, $1, $2, $3, $4, $5, $6) {
					if($3 == $5 || $3.length != 1) {
//						console.log(arguments);
						pipes[$4 || '1'] = $6;
				
						return $1;
					}
			
					return $A;
				});
				
				return { str: str, pipes: pipes };
			}
			
			str = replaceCommands(cmd, pipes).str;*/
			
			var inPipeName, inStr, startPipe, fileName, inFileName, pipeName, appending, pipeDir;
			
			for(var i = 0; i < chars.length; i++) {
				curChar = chars[i];
				
				if(curChar == '"' || curChar == "'" && (chars[i - 1] != '\\' || chars[i - 2] == '\\')) {
					if(inStr == curChar) {
						inStr = undefined;
					} else {
						inStr = curChar;
					}
				} else if(!inStr) {
					if(curChar == '>' || curChar == '<' && (chars[i - 1] != '\\' || chars[i - 2] == '\\')) {
						if(!inPipeName) {
							inPipeName = curChar;
							startPipe = i;
							pipeDir = curChar;
						} else if(inPipeName == curChar) {
							if(chars[i - 1] == inPipeName) {
								appending = true;
							} else {
								console.log(chars.slice(startPipe, i).join(''));
								pipeName = chars.slice(startPipe + 1, i).join('');
								inPipeName = undefined;
								inFileName = true;
								fileName = undefined;
							}
						}
					} else if(/^[\w\d\.\/]$/.test(curChar) && inFileName) {
						fileName = fileName ? fileName + curChar : curChar;
					} else if(/^\s$/.test(curChar) && fileName && inFileName) { // End of filename
						console.log(pipeName || (/^[12]$/.test(chars[startPipe - 1]) ? chars[startPipe - 1] : '1'), 'goes to', fileName, 'and is' + ( !!appending ? '' : ' not' ), 'appending');
						pipes[pipeName || (/^[12]$/.test(chars[startPipe - 1]) ? chars[startPipe - 1] : '1')] = { fileName: fileName, appending: !!appending, dir: pipeDir };
//						chars.splice(startPipe - ( /^\d$/.test(chars[startPipe - 1]) ? 1 : 0), 
						
						// Remove the pipe
						startRemove = startPipe - ( /^\d$/.test(chars[startPipe - 1]) ? 1 : 0);
						endRemove = i;
						chars.splice(startRemove, endRemove - startRemove);
						i -= endRemove - startRemove;
						// End remove pipe
						
						fileName = undefined;
						pipeName = undefined;
						inFileName = undefined;
					} else if(inPipeName && /^\s$/.test(curChar)) {
						inPipeName = undefined;
						inFileName = true;
						i = ( appending ? 1 : 0 ) + startPipe;
					}
					
					if(i == chars.length - 1) {
						if(inPipeName) {
							inPipeName = undefined;
							inFileName = true;
							i = startPipe;
						} else if(inFileName && fileName) {
							console.log(pipeName || (/^[12]$/.test(chars[startPipe - 1]) ? chars[startPipe - 1] : '1'), 'goes to', fileName, 'and is' + ( !!appending ? '' : ' not' ), 'appending');
							pipes[pipeName || (/^[12]$/.test(chars[startPipe - 1]) ? chars[startPipe - 1] : '1')] = { fileName: fileName, appending: !!appending, dir: pipeDir };
							
							// Remove the pipe
							startRemove = startPipe - ( /^\d$/.test(chars[startPipe - 1]) ? 1 : 0);
							endRemove = i + 1;
							chars.splice(startRemove, endRemove - startRemove);
							// End remove pipe
							
							fileName = undefined;
							pipeName = undefined;
							inFileName = undefined;
						}
					}
				}
			}
			
			//console.log(pipes, fileName, { inPipeName: inPipeName, inFileName: inFileName, inStr: inStr, startPipe: startPipe, fileName: fileName, pipeName: pipeName });
			
			return { pipedStr: chars.join(''), pipes: pipes };
		};
		
		CommandParser.prototype.splitCommands = function splitCommand(cmdLine) {
			var curChar, splits, i, inStr, split, chars, curSplit;
			
			splits = [];
			split = [];
			chars = cmdLine.split('');
			
			for(i = 0; i < cmdLine.length; i++) {
				curChar = chars[i];
				
				if(!inStr && (curChar == '"' || curChar == "'")) {
					inStr = curChar;
				} else if(curChar == inStr) {
					inStr = undefined;
				} else if(!inStr && (chars[i - 1] != '\\' || chars[i - 2] == '\\')) {
					if(/^(?:\&|\|)$/.test(curChar) && chars[i + 1] == curChar) {
						splits.push({ type: curChar + chars[i + 1], index: i });
						i++;
					} else if(/^(?:\;|\||\n)$/.test(curChar)) {
						splits.push({ type: curChar, index: i });
					}
				} else if((i > 0 ? chars[i - 1] == '\\' : false) && (i > 1 ? chars[i - 2] != '\\' : true) && curChar == '\n') {
					chars.splice(i - 1, 1);
					i--;
				}
			}
			
			for(i = 0; i < splits.length; i++) {
				curSplit = splits[i];
				
				split.push({ str: chars.slice(i > 0 ? splits[i - 1].index + splits[i - 1].type.length : 0, curSplit.index).join('').trim(), joiner: i > 0 ? splits[i - 1].type : '^' });
			}
			
			split.push({ str: chars.slice(!!curSplit ? curSplit.index + curSplit.type.length : 0).join('').trim(), joiner: curSplit ? curSplit.type : '^' });
			
			return split;
		};
		
		CommandParser.prototype.parse = function parse(cmdLine, execCmd) {
			var cmds, self;
			
			self = this;
			cmds = this.splitCommands(cmdLine);
			
			return cmds.map(function(cmd) {
				return merge(merge(cmd, { str: cmd.str }), self.parseFileStreams(cmd.str));
			}).map(function(cmd) {
				return merge(cmd, { args: self.cliParser.parse(cmd.pipedStr, self.env.vars, execCmd) });
			}).filter(function(cmd) {
				return cmd.str && cmd.str.length > 0 && cmd.joiner && cmd.joiner.length > 0 && cmd.args && cmd.args.length > 0;
			});
		};
		
		return CommandParser;
	})();
});
