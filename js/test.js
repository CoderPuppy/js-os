define(['require', 'exports', 'lib/index', 'lib/stream', 'lib/autocomplete'], function(require, exports, os, Stream, autoComplete) {
	var AutoCompleter = autoComplete.AutoCompleter;
	
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
	
	function getCaret(el) { 
	  if (el.selectionStart) { 
		return el.selectionStart; 
	  } else if (document.selection) { 
		el.focus(); 

		var r = document.selection.createRange(); 
		if (r == null) { 
		  return 0; 
		} 

		var re = el.createTextRange(), 
			rc = re.duplicate(); 
		re.moveToBookmark(r.getBookmark()); 
		rc.setEndPoint('EndToStart', re); 

		return rc.text.length; 
	  }  
	  return 0; 
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
			this.runCMDEl.addEventListener('keyup', function() {
				// Auto complete
				var cursor = getCaret(this);
				console.log('cursor:', cursor);
				self.updateAutoCompleteList(self.autoCompleter.autoComplete(this.value, cursor, self.terminal));
			});
			
			this.runEl.appendChild(this.runCMDEl);
			
			this.runBtnEl = document.createElement('button');
			this.runBtnEl.textContent = 'Run';
			this.runBtnEl.addEventListener('click', function() {
				self.terminal.runCMD(self.runCMDEl.value);
				self.runCMDEl.value = '';
			});
			
			this.runEl.appendChild(this.runBtnEl);
			
			this.autoCompleteListEl = document.createElement('ul');
			this.autoCompleteListEl.className = 'view-autocomplete';
			
			this.runEl.appendChild(this.autoCompleteListEl);
			
			this.el.appendChild(this.runEl);
			
			document.body.appendChild(this.el);
			
			this.autoCompleter = new AutoCompleter(this.terminal);
		}
		
		View.prototype.setTerminal = function setMachine(terminal) {
			this.terminal = terminal;
			this.fs = this.terminal.fs;
			this.currentDir = this.terminal.currentDir;
		};
		
		View.prototype.createRunView = function createRunView(runContext, cmdLine) {
			return new RunView(this, runContext, cmdLine);
		};
		
		View.prototype.updateAutoCompleteList = function updateAutoCompleteList(autoComplete) {
			var tmpEl, self = this;
			
			this.autoCompleteListEl.innerHTML = 'AutoComplete:<br />';
			
			for(var i = 0; i < autoComplete.length; i++) {
				tmpEl = document.createElement('li');
				tmpEl.className = 'view-autocomplete-item';
				tmpEl.textContent = autoComplete[i].name;
				tmpEl.addEventListener('click', (function(i) {
					return function() {
						self.runCMDEl.value = autoComplete[i].full;
					};
				})(i));
				
				this.autoCompleteListEl.appendChild(tmpEl);
			}
			
			return this;
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
		
		RunView.prototype.createCMDView = function createCMDView(cmdContext, cmd, options) {
			return new CMDView(this, cmdContext, cmd, options);
		};
		
		return RunView;
	})();
	
	var CMDView = exports.CMDView = (function() {
		function CMDView(runView, cmdContext, cmd, options) {
			var self = this;
			
			this.runView = runView;
			this.options = options || {};
			this.cmdContext = cmdContext;
			this.cmd = cmd;
			this.pipe = this.options.pipe || false;
			this.exitCode = 'Unknown';
			
			this.output = [];
			
			this.el = document.createElement('div');
			this.el.className = 'cmd-view';
			this.el.textContent = 'CMDView: ' + cmd.str;
			
			this.exitCodeEl = document.createElement('span');
			this.exitCodeEl.className = 'cmd-view-exit-code';
			this.exitCodeEl.textContent = this.exitCode;
			this.el.appendChild(this.exitCodeEl);
			
			this.outputEl = document.createElement('div');
			this.outputEl.className = 'cmd-view-output';
			this.el.appendChild(this.outputEl);
			
			if(this.pipe == 'later') this.runView.el.insertBefore(this.el, this.runView.el.childNodes[this.runView.el.childNodes.length - 1]);
			else this.runView.el.appendChild(this.el);
			
			
			this.stream = new Stream();
			
			this.stream.on('data', function(data) {
				self.output.push(data);
				self.outputEl.innerHTML += (self.outputEl.childNodes.length > 0 ? '<br />' : '') + data;
			});
		}
		
		CMDView.prototype.setExitCode = function setExitCode(code) {
			this.exitCode = code;
			this.exitCodeEl.textContent = code;
		};
		
		return CMDView;
	})();
	
	var machine = exports.machine = new os.Machine('test_machine');
	var view = exports.view = new View();
	var terminal = exports.terminal = machine.createTerminal(view);
	
	console.log('echo hi:', terminal.runCMD('echo hi'));
});
