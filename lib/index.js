define(['require', 'exports', './terminal', './env', './fs/index'], function(require, exports, terminal, env, fs) {
	var Terminal = exports.Terminal = terminal.Terminal;
	var Enviorment = exports.Enviorment = env.Enviorment;
	var Filesystem = exports.Filesystem = fs.Filesystem;
	
	exports.Machine = (function() {
		function Machine(name) {
			this.name = name;
			
			var fsData;
			
//			try {
//				fsData = JSON.parse(localStorage.machines)[name];
//			} catch(e) {
				fsData = {
					root: {
						files: {
							cmdTest: {
								executable: true,
								command: {
									exec: function(args, pipes) {
										console.log(args, pipes);
									}
								}
							},
							shTest: {
								executable: true,
								contents: "echo hi"
							},
							echo: {
								executable: true,
								command: {
									exec: function(args, cmdContext) {
										console.log(args, cmdContext);
									
										cmdContext.view.stream.emit('data', args.join(' '));
									}
								}
							}
						}
					}
				};
//			}
			
			this.fs = new Filesystem(fsData);
			this.env = new Enviorment({
				vars: {
					PATH: ""
				}
			}, this.fs);
			
			try {
				var machines = JSON.parse(localStorage.machines);
			} catch(e) {
				var machines = {};
			}
			
			machines[this.name] = this.fs.data;
			
			localStorage.machines = JSON.stringify(machines);
		}
		
		Machine.prototype.createTerminal = function createTerminal(view) {
			return new Terminal(this, view);
		};
		
		return Machine;
	})();
});
