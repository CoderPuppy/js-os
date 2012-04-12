define(['require', 'exports', 'lib/index', 'lib/stream'], function(require, exports, os, Stream) {
	var htmlBadChars = {
		'|': '#124'
	};
	
	function htmlEscape(str) {
		var chars = Object.keys(htmlBadChars);
		for(var i = 0; i < chars.length; i++) {
			str = str.split(chars[i]).join('&' + htmlBadChars[chars[i]] + ';');
		}
		
		return str;
	}

	var View = exports.View = (function() {
		function View() {
			var self = this;
			
			this.el = document.createElement('div');
			this.el.className = 'view';
			this.el.textContent = 'View: ' + '';
			
			// Way to run commands through the browser
			this.runEl = document.createElement('div');
			this.runEl.className = 'view-run-cmd';
			
			this.runCMDEl = document.createElement('textarea');
			
			this.runEl.appendChild(this.runCMDEl);
			
			this.runBtnEl = document.createElement('button');
			this.runBtnEl.textContent = 'Run';
			this.runBtnEl.addEventListener('click', function() {
				self.terminal.runCMD(self.runCMDEl.value);
				self.runCMDEl.value = '';
			});
			
			this.runEl.appendChild(this.runBtnEl);
			
			this.el.appendChild(this.runEl);
			
			document.body.appendChild(this.el);
		}
		
		View.prototype.setTerminal = function setMachine(terminal) {
			this.terminal = terminal;
			this.fs = this.terminal.fs;
			this.currentDir = this.terminal.currentDir;
		};
		
		View.prototype.createRunView = function createRunView(runContext, cmdLine) {
			return new RunView(this, runContext, cmdLine);
		};
		
		return View;
	})();
	
	var RunView = exports.RunView = (function() {
		function RunView(view, runContext, cmdLine) {
			this.view = view;
			this.runContext = runContext;
			this.cmdLine = cmdLine;
			
			this.el = document.createElement('div');
			
			this.el.className = 'run-view';
			
			this.el.textContent = 'RunView: ' + this.cmdLine.map(function(cmd) {
				return  ( cmd.joiner == '^' ? '' : ' ' + cmd.joiner ) + cmd.str + ' ';
			}).join(' ');
			
			this.view.el.insertBefore(this.el, this.view.el.childNodes[this.view.el.childNodes.length - 1]);
		}
		
		RunView.prototype.createCMDView = function createCMDView(cmdContext, cmd) {
			return new CMDView(this, cmdContext, cmd);
		};
		
		return RunView;
	})();
	
	var CMDView = exports.CMDView = (function() {
		function CMDView(runView, cmdContext, cmd) {
			var self = this;
			
			this.runView = runView;
			this.cmdContext = cmdContext;
			this.cmd = cmd;
			
			this.output = [];
			
			this.el = document.createElement('div');
			this.el.className = 'cmd-view';
			this.el.textContent = htmlEscape('CMDView: ' + cmd.str);
			
			this.outputEl = document.createElement('div');
			this.outputEl.className = 'cmd-view-output';
			this.el.appendChild(this.outputEl);
			
			this.runView.el.insertBefore(this.el, this.runView.el.childNodes[1]);
			
			this.stream = new Stream();
			
			this.stream.on('data', function(data) {
				self.output.push(data);
				self.outputEl.innerHTML += (self.outputEl.childNodes.length > 0 ? '<br />' : '') + data;
			});
		}
		
		return CMDView;
	})();
	
	var machine = exports.machine = new os.Machine('test_machine');
	var view = exports.view = new View();
	var terminal = exports.terminal = machine.createTerminal(view);
	
	console.log('echo hi:', terminal.runCMD('echo hi'));
});
