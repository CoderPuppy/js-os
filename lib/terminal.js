define(['require', 'exports', './env', './events', './commandRunner', './runContext'], function(require, exports, env, events, commandRunner, runContext) {
	var Environment = env.Environment;
	var RunContext = runContext.RunContext;
	var EventEmitter = events.EventEmitter;
	var CommandRunner = commandRunner.CommandRunner;
	
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
	
	var merge = function(dest, source) {
		for(key in source) {
			dest[key] = source[key];
		}
		
		return dest;
	};
	
	exports.Terminal = (function() {
		function Terminal(os, view) {
			var self = this;
			
			this.env = new Environment(os.env);
			this.fs = os.fs;
			this.commandRunner = new CommandRunner(this);
			this.currentDir = this.fs.currentDir;
			this.view = view;
			
			this.runContexts = [];
			
			if(this.view && typeof(this.view.setTerminal) == 'function') this.view.setTerminal(this);
			
			EventEmitter.call(this);
			
			this.commandRunner.on('command:run', function(pipes) {
				self.emit('command:run', pipes);
			});
		}
		
		inherits(Terminal, EventEmitter);
		
		Terminal.prototype.runCMD = function runCMD(cmd, cb) {
			return this.commandRunner.run(cmd, this.currentDir, cb);
		};
		
		Terminal.prototype.findCMD = function findCMD(cmdName, curDir) {
			/*var pathSplit, cmdSplit, i;
			
			pathSplit = this.env.vars.PATH.split(':');
			cmdSplit = cmdName.split('/');
			
			for(i = 0; i < pathSplit.length; i++) {
				if(this.fs.hasFile(this.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), this.fs.getFile(pathSplit[i])), cmdSplit[cmdSplit.length - 1])) {
					if(this.fs.isExec(tmpFile = this.fs.getFile(cmdName, this.fs.getFile(pathSplit[i])))) {
						return tmpFile;
					}
				}
			}
			
			if(this.fs.hasFile(this.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), this.currentDir), cmdSplit[cmdSplit.length - 1])) {
				if(this.fs.isExec(tmpFile = this.fs.getFile(cmdName, this.currentDir))) {
					return tmpFile;
				}
			}
			
			if(this.fs.hasFile(this.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), curDir), cmdSplit[cmdSplit.length - 1])) {
				if(this.fs.isExec(tmpFile = this.fs.getFile(cmdName, curDir))) {
					return tmpFile;
				}
			}
			
			return undefined;*/
			
			var tmpFile = this.getPath(curDir).filter(function(file) {
				return file.name == cmdName && file.executable;
			})[0];
			
			if(!tmpFile) {
				var cmdSplit = cmdName.split('/'), pathSplit = this.env.vars.PATH.split(':'), i;
			
				for(i = 0; i < pathSplit.length; i++) {
					if(this.fs.hasFile(this.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), this.fs.getFile(pathSplit[i])), cmdSplit[cmdSplit.length - 1])) {
						if(this.fs.isExec(tmpFile = this.fs.getFile(cmdName, this.fs.getFile(pathSplit[i])))) {
							return tmpFile;
						}
					}
				}
			
				if(this.fs.hasFile(this.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), this.currentDir), cmdSplit[cmdSplit.length - 1])) {
					if(this.fs.isExec(tmpFile = this.fs.getFile(cmdName, this.currentDir))) {
						return tmpFile;
					}
				}
			
				if(this.fs.hasFile(this.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), curDir), cmdSplit[cmdSplit.length - 1])) {
					if(this.fs.isExec(tmpFile = this.fs.getFile(cmdName, curDir))) {
						return tmpFile;
					}
				}
			}
			
			return tmpFile;
		};
		
		Terminal.prototype.getPath = function getPath(curDir) {
			var files = {}, pathSplit = this.env.vars.PATH.split(':');
			
			for(i = 0; i < pathSplit.length; i++) {
				files = merge(files, this.fs.getFile(pathSplit[i]).files);
			}
			
			if(curDir) files = merge(files, curDir.files);
			files = merge(files, this.currentDir.files);
			
			return Object.keys(files).map(function(name) {
				return files[name];
			});
		};
		
		Terminal.prototype.createRunContext = function createRunContext(cmdLine, invisible) {
			return this.runContexts[this.runContexts.push(new RunContext(this, cmdLine, invisible)) - 1];
		};
		
		return Terminal;
	})();
});
