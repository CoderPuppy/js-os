define(['require', 'exports', './commandParser'], function(require, exports, cmdParser) {
	var CommandParser = cmdParser.CommandParser;
	
	var AutoCompleter = exports.AutoCompleter = (function() {
		function AutoCompleter() {
			this.cmdParser = new CommandParser({
				vars: {
					PATH: '/bin:/usr/bin'
				}
			});
		}
		
		AutoCompleter.prototype.autoComplete = function autoComplete(cmdLine, position, terminal) {
			var cmdName, args, parsed;
			
			parsed = this.parse(cmdLine);
			args = parsed[0].args;
			cmdName = args.splice(0, 1);
			
			console.log(cmdName + ':', args);
			
			var autoCompleteCMD = position && position.length > 0 ? parsed[position[0]] : parsed[parsed.length - 1];
			var autoCompleteArg = position && position.length > 1 ? autoCompleteCMD.args[position[1]] : autoCompleteCMD.args[autoCompleteCMD.args.length - 1];
			var autoCompleteBefore = position && position.length > 2 ? autoCompleteArg.substr(0, position[3]) : autoCompleteArg;
			
			console.log(autoCompleteCMD, autoCompleteArg, autoCompleteBefore);
		};
		
		AutoCompleter.prototype.parse = function parse(cmdLine) {
			var errMatch;
			
			try {
				return this.cmdParser.parse(cmdLine);
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
		
		return AutoCompleter;
	})();
});
