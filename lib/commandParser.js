define(['require', 'exports', './cli-parser/js/parser'], function(require, exports, cliParser) {
	var CLIParser = cliParser.Parser;
	
	var merge = function merge(dest, source) {
		for(key in source) {
			dest[key] = source[key];
		}
		
		return dest;
	};
	
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
