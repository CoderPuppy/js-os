define(function(require, exports, module) {
	var RunContext = require('./runContext').RunContext; // let us create run contexts
	var EventEmitter = require('./events').EventEmitter; // emit events
	var CommandRunner = require('./commandRunner').CommandRunner; // we might want to be able to run commands
	
	var inherits = function(ctor, superCtor) { // inherits: make `ctor` inherit from `superCtor`
	  ctor.super_ = superCtor; // save superCtor in ctor.super_
	  ctor.prototype = Object.create(superCtor.prototype, { // make it's prototype a superCtor without calling it's constructor
		constructor: { // but keep the constructor the same
		  value: ctor,
		  enumerable: false,
		  writable: true,
		  configurable: true
		}
	  });
	};
	
	var merge = function(dest, source) { // merge: merge all enumerable properties of source into dest
		for(key in source) { // loop through all the properties
			dest[key] = source[key]; // and set them
		}
		
		return dest; // make it easier to use it
	};
	
	exports.Terminal = (function() { // Class Terminal
		function Terminal(session, view) { // Terminal: the session that this terminal belongs to and the view to use to display output
			var self = this; // save this
			
			this.session = session; // save the session
			this.fs = this.session.fs; // and also it's filesystem
			this.machine = this.session.machine; // and also the machine
			this.env = new Environment(this.machine.env); // create an environment with global environment
			this.commandRunner = new CommandRunner(this); // let us run commands
			this.currentDir = this.fs.currentDir; // don't need this any more
			this.view = view; // save the view
			
			this.runContexts = []; // to save all run contexts
			
			if(this.view && typeof(this.view.setTerminal) == 'function') this.view.setTerminal(this); // make sure we have a view if so then set the view's terminal to this
			
			EventEmitter.call(this); // let this emit events
			
			this.commandRunner.on('command:run', function(pipes) { // listen for commands being run
				self.emit('command:run', pipes); // and emit it again
			});
		}
		
		inherits(Terminal, EventEmitter); // make Terminal an EventEmitter
		
		Terminal.prototype.runCMD = function runCMD(cmd, cb) { // pass through for running commands
			return this.commandRunner.run(cmd, this.currentDir, cb); // pass it through
		};
		
		Terminal.prototype.findCMD = function findCMD(cmdName, curDir) { // find what command to run
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
			
			var tmpFile = this.getPath(curDir).filter(function(file) { // first look at commands in the path (cannot work with folders)
				return file.name == cmdName && file.executable; // look for files with names
			})[0];
			
			if(!tmpFile) { // if we didn't get a file use the old method
				var cmdSplit = cmdName.split('/'), pathSplit = this.env.vars.PATH.split(':'), i; // split the command and the path
			
				for(i = 0; i < pathSplit.length; i++) { // loop through the folders in the path
					if(this.fs.hasFile(this.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), this.fs.getFile(pathSplit[i])), cmdSplit[cmdSplit.length - 1])) { // check if there is a file that matches
						if(this.fs.isExec(tmpFile = this.fs.getFile(cmdName, this.fs.getFile(pathSplit[i])))) { // check if it's executable
							return tmpFile; // return it
						}
					}
				}
			
				if(this.fs.hasFile(this.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), this.currentDir), cmdSplit[cmdSplit.length - 1])) { // check for it in the current dir
					if(this.fs.isExec(tmpFile = this.fs.getFile(cmdName, this.currentDir))) { // check if it's executable
						return tmpFile; // return it
					}
				}
			
				if(this.fs.hasFile(this.fs.getFile(cmdSplit.slice(0, cmdSplit.length - 1).join('/'), curDir), cmdSplit[cmdSplit.length - 1])) { // check for it in the current dir
					if(this.fs.isExec(tmpFile = this.fs.getFile(cmdName, curDir))) { // check if it's executable
						return tmpFile; // return it
					}
				}
			}
			
			return tmpFile; // return it
		};
		
		Terminal.prototype.getPath = function getPath(curDir) { // getPath: get all files in the path and also in `curDir`
			var files = {}, pathSplit = this.env.vars.PATH.split(':'); // split the path
			
			for(i = 0; i < pathSplit.length; i++) { // loop through the folders in the path
				files = merge(files, this.fs.getFile(pathSplit[i]).files); // merge in all the files in that folder
			}
			
			if(curDir) files = merge(files, curDir.files); // also put in the files in curDir
			files = merge(files, this.currentDir.files); // and the ones in this.currentDir
			
			return Object.keys(files).map(function(name) { // then just get the values
				return files[name];
			});
		};
		
		Terminal.prototype.createRunContext = function createRunContext(cmdLine, invisible) { // createRunContext: the cmdline that had been run and whether it should create a run view
			return this.runContexts[this.runContexts.push(new RunContext(this, cmdLine, invisible)) - 1]; // save it in this.runContexts
		};
		
		return Terminal;
	})();
});
