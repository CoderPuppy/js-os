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
			
			if(typeof(position) == 'number') position = this.positionFromCursorPos(cmdLine, position);
			
			parsed = this.parse(cmdLine);
			args = parsed[0].args;
			cmdName = args.splice(0, 1)[0];
			terminal = terminal || this.terminal;
			
			console.log(cmdName + ':', args);
			
			var autoCompleteCMD = position && position.length > 0 ? parsed[position[0]] : parsed[parsed.length - 1];
			var autoCompleteFile = terminal.findCMD(cmdName);
			if(autoCompleteFile) {
				var autoCompleteArgIndex = position && position.length > 1 ? position[1] : autoCompleteCMD.args.length - 1;
				var autoCompleteArg = autoCompleteCMD.args[autoCompleteArgIndex];
				var autoCompleteArgDef = autoCompleteFile.command.params ? autoCompleteFile.command.params[autoCompleteArgIndex] : undefined;
				if(autoCompleteArgDef) {
					var autoCompleteBefore = position && position.length > 2 ? autoCompleteArg.substr(0, position[3]) : autoCompleteArg;
			
					console.log(autoCompleteCMD, autoCompleteFile, autoCompleteArg, autoCompleteBefore, autoCompleteArgDef);
			
					return ((new Argument(( typeof(autoCompleteArgDef.type) == 'string' ? autoCompleteArgDef.type : autoCompleteArgDef.type.name ),
							( typeof(autoCompleteArgDef.type) == 'object' ? autoCompleteArgDef.type : {} )))
							.setInput(autoCompleteArg).autoComplete(autoCompleteBefore) || []).map(function(completion) {
								return {
									name: completion,
									full: cmdLine.substr(0, autoCompleteArg.begin) + completion + cmdLine.substr(autoCompleteArg.end)
								};
							});
				} else {
					return [];
				}
			} else {
				return [];
			}
		};
		
		AutoCompleter.prototype.parse = function parse(cmdLine, parser) {
			var errMatch;
			
			try {
				return (parser || this.autoCompleteCmdParser).parse(cmdLine, {}, function(cmd) { return cmd; }, {
					checkStr: false
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
			var parsed = this.parse(value, this.findPosCmdParser), args;
			
			for(var i = 0; i < parsed.length; i++) {
				if(parsed[i].begin <= cursor && parsed[i].end >= cursor) {
					args = parsed[i].args;
					
					for(var e = 0; e < args.length; e++) {
						if(args[e].begin <= cursor + 1 && args[e].end > cursor) {
							return [i, e, (cursor + 1) - args[e].begin];
						}
					}
				}
			}
		};
		
		return AutoCompleter;
	})();
});
