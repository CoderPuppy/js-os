define(function(require, exports, module) {
	var Stream = require('./stream');
	
	var CMDContext = exports.CMDContext = (function() {
		function CMDContext(runContext, cmd, options) {
			this.runContext = runContext;
			this.cmd = cmd;
			this.options = options || {};
			this.invisible = !!this.options.invisible;
			this.pipe = !!options.pipe ? options.pipe : false;
			//this.filePipes = options.filePipes || {};
			this.filePipes = cmd.pipes || {};
			if(!this.invisible) this.view = this.runContext.view.createCMDView(this, this.cmd, { pipe: this.pipe });
			else this.view = { stream: new Stream() }
			
			this.data = new Stream();
			this.err  = new Stream();
			
			this.fs = this.runContext.fs;
			this.env = this.runContext.env;
			this.terminal = this.runContext.terminal;
			
			this.exitCode = undefined;
			
			this.pipes = {};
			
			var pipeName, file, fileStream;
			
			for(pipeName in this.filePipes) {
				if(pipeName != '1' && pipeName != '2') {
					this.pipes[pipeName] = new Stream();
				
					if(!this.fs.hasFile(this.currentDir, this.filePipes[pipeName].fileName)) this.fs.createFile(this.filePipes[pipeName].fileName, this.currentDir);
				
					file = this.pipes[pipeName].file = this.fs.getFile(this.filePipes[pipeName].fileName, this.currentDir);
				
					fileStream = this.pipes[pipeName].fileStream = this.fs.openStream(file, {
						dir: this.filePipes[pipeName].dir[0] == '>' ? 'out' : 'in',
						appending: this.filePipes[pipeName].appending
					});
				
					( this.filePipes[pipeName].dir[0] == '>' ? this.data : fileStream ).pipe(( this.filePipes[pipeName].dir[0] == '<' ? this.data : fileStream ));
				}
			}
			
			if(this.filePipes['1']) {
				if(!this.fs.hasFile(this.currentDir, this.filePipes['1'].fileName)) this.fs.createFile(this.filePipes['1'].fileName, this.currentDir);
				
				file = this.data.file = this.fs.getFile(this.filePipes['1'].fileName, this.currentDir);
			
				fileStream = this.data.fileStream = this.fs.openStream(file, {
					dir: this.filePipes['1'].dir[0] == '>' ? 'out' : 'in',
					appending: this.filePipes['1'].appending
				});
			
				( this.filePipes['1'].dir[0] == '>' ? this.data : fileStream ).pipe(( this.filePipes['1'].dir[0] == '<' ? this.data : fileStream ));
			}
			
			if(this.filePipes['2']) {
				if(!this.fs.hasFile(this.currentDir, this.filePipes['2'].fileName)) this.fs.createFile(this.filePipes['2'].fileName, this.currentDir);
				
				file = this.data.file = this.fs.getFile(this.filePipes['2'].fileName, this.currentDir);
			
				fileStream = this.data.fileStream = this.fs.openStream(file, {
					dir: this.filePipes['2'].dir[0] == '>' ? 'out' : 'in',
					appending: this.filePipes['2'].appending
				});
			
				( this.filePipes['2'].dir[0] == '>' ? this.err : fileStream ).pipe(( this.filePipes['2'].dir[0] == '<' ? this.err : fileStream ));
			}
		}
		
		CMDContext.prototype.pipeTo = function pipeTo(dest) {
			this.data.pipe(dest.data);
			this.err.pipe(dest.data);
			
			return dest;
		};
		
		CMDContext.prototype.setExitCode = function setExitCode(code) {
			if(this.view && typeof(this.view.setExitCode) == 'function') this.view.setExitCode(code);
			this.exitCode = code;
			
			return this;
		};
		
		CMDContext.prototype.runCMD = function runCMD(cmd, cb) {
			return this.terminal.runCMD(cmd, cb);
		};
		
		return CMDContext;
	})();
});
