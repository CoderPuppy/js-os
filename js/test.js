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
			this.el = document.createElement('div');
			
			this.el.className = 'view';
			
			this.el.textContent = 'View: ' + '';
			
			document.body.appendChild(this.el);
		}
		
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
			
			this.el.textContent = htmlEscape('RunView: ' + this.cmdLine.map(function(cmd) {
				return cmd.str;
			}).join(' '));
			
			view.el.appendChild(this.el);
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
			
			this.outputEl = document.createElement('ul');
			this.el.appendChild(this.outputEl);
			
			runView.el.appendChild(this.el);
			
			this.stream = new Stream();
			
			this.stream.on('data', function(data) {
				var el = document.createElement('li');
				el.textContent = data;
				self.output.push(data);
				self.outputEl.appendChild(el);
			});
		}
		
		return CMDView;
	})();
	
	var machine = exports.machine = new os.Machine('test_machine');
	var view = exports.view = new View();
	var terminal = exports.terminal = machine.createTerminal(view);
	
	console.log('echo hi:', terminal.runCMD('echo hi'));
});
