define(['require', 'exports', './cli-parser/js/parser.js'], 
function(require, exports, cliParser) {
	var CLIParser = cliParser.Parser;
	
	var CommandRunner = exports.CommandRunner = (function() {
		function CommandRunner(env) {
			this.env = env;
			this.commandParser = new CommandParser(env);
		}
		
		CommandRunner.prototype.run = function run(cmd) {
			return this.commandParser.parse(cmd);
		};
		
		return CommandRunner;
	})();
	
	var CommandParser = exports.CommandParser = (function() {
		function CommandParser(env) {
			this.env = env;
			this.cliParser = new CLIParser();
		}
		
		CommandParser.prototype.splitCommands = function splitCommand(cmdLine) {
			var curChar, splits, i, inStr, split, chars, curSplit;
			
			splits = [];
			split = [];
			chars = cmdLine.split('');
			
			for(i = 0; i < cmdLine.length; i++) {
				curChar = cmdLine[i];
				
				if(!inStr && (curChar == '"' || curChar == "'")) {
					inStr = curChar;
				} else if(curChar == inStr) {
					inStr = undefined;
				} else if(!inStr && (cmdLine[i - 1] != '\\' || cmdLine[i - 2] == '\\')) {
					if(/^(?:\&|\|)$/.test(curChar) && cmdLine[i + 1] == curChar) {
						splits.push({ type: curChar + cmdLine[i + 1], index: i });
						i++;
					} else if(/^(?:\;|\|)$/.test(curChar)) {
						splits.push({ type: curChar, index: i });
					}
				}
			}
			
			for(i = 0; i < splits.length; i++) {
				curSplit = splits[i];
				
				split.push({ str: chars.slice(i > 0 ? splits[i - 1].index + splits[i - 1].type.length : 0, curSplit.index).join('').trim(), joiner: i > 0 ? splits[i - 1].type : '^' });
			}
			
			split.push({ str: chars.slice(!!curSplit ? curSplit.index + curSplit.type.length : 0).join('').trim(), joiner: curSplit ? curSplit.type : '^' });
			
			return split;
		};
		
		CommandParser.prototype.parse = function parse(cmdLine) {
			var cmds, self;
			
			self = this;
			cmds = this.splitCommands(cmdLine);
			
//			return this.cliParser.parse(cmd, this.env.vars);
			return cmds.map(function(cmd) {
				return { args: self.cliParser.parse(cmd.str, self.env.vars), str: cmd.str, joiner: cmd.joiner };
			}).filter(function(cmd) {
				return cmd.str && cmd.str.length > 0 && cmd.joiner && cmd.joiner.length > 0 && cmd.args && cmd.args.length > 0;
			});
		};
		
		return CommandParser;
	})();
});
