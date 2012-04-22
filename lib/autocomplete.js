define(['require', 'exports', './commandParser', './argument'], function(require, exports, cmdParser, argument) {
	var Argument = argument.Argument;
	var CommandParser = cmdParser.CommandParser;
	
	var AutoCompleter = exports.AutoCompleter = (function() {
		function AutoCompleter(terminal) {
			this.terminal = terminal;
			
			this.autoCompleteCmdParser = new CommandParser(terminal && terminal.env ? terminal.env : { vars: {} });			
			this.findPosCmdParser = new CommandParser({
				vars: {
					PATH: '/bin:/usr/bin'
				}
			});
		}
		
		AutoCompleter.prototype.autoComplete = function autoComplete(cmdLine, position, terminal) {
			var cmdName, args, parsed;
			
			if(typeof(cmdLine) == 'object' && typeof(cmdLine.length) != 'undefined') {
				parsed = cmdLine;
				cmdLine = parsed.text;
			} else {
				parsed = this.parse(cmdLine);
			}
			
			if(typeof(position) == 'number') position = this.positionFromCursorPos(parsed, position);
			
			args = parsed[position && position.length > 0 ? position[0] : parsed.length - 1].args;
			
			if(args.length <= 1 && args[0] && args[0].length <= 0) {
				while(args[0] && args[0].length <= 0) {
					args.splice(0, 1);
				}
			}
			
			cmdName = args.splice(0, 1)[0];
			terminal = terminal || this.terminal;
			
			var autoCompleteCMD = position && position.length > 0 ? parsed[position[0]] : parsed[parsed.length - 1];
			var autoCompleteFile = terminal.findCMD(cmdName || '');
			if(autoCompleteFile) {
				var autoCompleteArgIndex = position && position.length > 1 ? position[1] : autoCompleteCMD.args.length - 1;
				var autoCompleteArg = autoCompleteCMD.args[autoCompleteArgIndex];
				var autoCompleteArgDef = autoCompleteFile.command.params ? autoCompleteFile.command.params[autoCompleteArgIndex] : undefined;
				if(autoCompleteArgDef) {
					var autoCompleteBefore = position && position.length > 2 ? autoCompleteArg.substr(0, position[3]) : autoCompleteArg;
			
					rtn = ((new Argument(( typeof(autoCompleteArgDef.type) == 'string' ? autoCompleteArgDef.type : autoCompleteArgDef.type.name ),
							( typeof(autoCompleteArgDef.type) == 'object' ? autoCompleteArgDef.type : {} )))
							.setInput(autoCompleteArg).autoComplete(autoCompleteBefore) || []).map(function(completion) {
								return {
									name: completion,
									full: cmdLine.substr(0, autoCompleteArg.begin) + completion + cmdLine.substr(autoCompleteArg.end)
								};
							});
					rtn.index = autoCompleteArg.begin;
				} else if(autoCompleteArgIndex == -1) {
					var cmdSplit = cmdName ? cmdName.split('/') : [];
					rtn = terminal.getPath(terminal.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), terminal.currentDir))
						.filter(function(file) {
							return file.executable && ( cmdName ? file.name.substr(0, cmdSplit[cmdSplit.length - 1].length) == cmdSplit[cmdSplit.length - 1] : true );
						}).map(function(file) {
							return {
								name: ( cmdSplit.length > 1 ? terminal.fs.pathTo(file) : file.name ),
								full: ( autoCompleteCMD ? cmdLine.substr(0, autoCompleteCMD.begin) : '' ) +
									( cmdSplit.length > 1 ? terminal.fs.pathTo(file) : file.name ) +
									( cmdName ? cmdLine.substr(cmdName.end) : '' )
							};
						});
				} else {
					rtn = [];
				}
				
				rtn.index = autoCompleteArg ? autoCompleteArg.begin : 0;
			} else {
				var cmdSplit = cmdName ? cmdName.split('/') : [];
				rtn = terminal.getPath(terminal.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), terminal.currentDir))
					.filter(function(file) {
						return file.executable && ( cmdName ? file.name.substr(0, cmdSplit[cmdSplit.length - 1].length) == cmdSplit[cmdSplit.length - 1] : true );
					}).map(function(file) {
						return {
							name: ( cmdSplit.length > 1 ? terminal.fs.pathTo(file) : file.name ),
							full: ( autoCompleteCMD ? cmdLine.substr(0, autoCompleteCMD.begin) : '' ) +
								( cmdSplit.length > 1 ? terminal.fs.pathTo(file) : file.name ) +
								( cmdName ? cmdLine.substr(cmdName.end) : '' )
						};
					});
				rtn.index = 0;
			}
			
			return rtn;
		};
		
		AutoCompleter.prototype.parse = function parse(cmdLine, parser) {
			var errMatch;
			
			try {
				return (parser || this.autoCompleteCmdParser).parse(cmdLine, undefined, function(cmd) { return cmd; }, {
					checkCmd: false,
					checkStr: false,
					checkArgs: false
				});
			} catch(e) {
				if(errMatch = /Unclosed quotation at\: (\d*|end) type\: ("|')/.exec(e)) {
					if(errMatch[1] == 'end') {
						return this.parse(cmdLine + errMatch[2]);
					}
				} else {
					console.log('Unknown error:', e, e.stack, e.message);
				}
			}
		};
		
		AutoCompleter.prototype.positionFromCursorPos = function positionFromCursorPos(value, cursor) {
			var parsed = ( typeof(value) == 'object' && typeof(value.length) != 'undefined' ? value : this.parse(value, this.findPosCmdParser) ), args;
			
			for(var i = 0; i < parsed.length; i++) {
				if(parsed[i].begin <= cursor && parsed[i].end >= cursor) {
					args = parsed[i].args;
					
					for(var e = 0; e < args.length; e++) {
						if(args[e].begin <= cursor && args[e].end >= cursor) {
							return [i, e - 1, (cursor - 1) - args[e].begin];
						}
					}
				}
			}
		};
		
		AutoCompleter.prototype.isValid = function isValid(cmdLine) {
			
		};
		
		return AutoCompleter;
	})();
});
