define(['require', 'exports', './terminal', './env', './fs/index'], function(require, exports, terminal, env, fs) {
	var Terminal = exports.Terminal = terminal.Terminal;
	var Environment = exports.Environment = env.Environment;
	var Filesystem = exports.Filesystem = fs.Filesystem;
	
	exports.Machine = (function() {
		function Machine(name, fsData) {
			this.name = name;
			
			fsData = fsData || {
				root: {
					files: {
						bin: {
							files: {
								echo: {
									executable: true,
									command: {
										exec: function(args, context) {
											context.view.stream.write(args.join(' '));
											context.data.write(args.join(' '));
										}
									}
								},
								pwd: {
									executable: true,
									command: {
										exec: function(args, context) {
											context.view.stream.write(context.fs.pathTo(context.currentDir));
											context.data.write(context.fs.pathTo(context.currentDir));
										}
									}
								},
								ls: {
									executable: true,
									command: {
										exec: function(args, context) {
											var files = context.fs.listFiles(context.fs.getFile(args[0], context.currentDir));
											
											files.forEach(function(file) {
												context.view.stream.write(file.name);
											});
										}
									}
								},
								cd: {
									executable: true,
									command: {
										exec: function(args, context) {
											context.currentDir = context.fs.getFile(args[0], context.currentDir) || context.currentDir;
										}
									}
								},
								alert: {
									executable: true,
									command: {
										exec: function(args, context) {
											if(args.length > 0 && args[0]) alert(args.join(' '));
											context.data.on('data', function(d) {
												alert(d);
											}).unpause();
										}
									}
								},
								sleep: {
									executable: true,
									command: {
										exec: function(args, context, cb) {
											var time = /^[1-9]\d*$/.test(args[0]) ? parseInt(args[0]) : 1000;
											setTimeout(function() { cb(0); }, time);
										}
									}
								},
								test: {
									executable: true,
									command: {
										exec: function(args, context) {
											console.log(arguments);
											context.data.on('data', function(d) {
												alert('someone sent me: ' + d);
											});
										}
									}
								},
								badExit: {
									executable: true,
									command: {
										exec: function(args, context) {
											context.view.stream.write('I have an error');
											context.err.write('I have an error');
											return 1;
										}
									}
								}
							}
						}
					}
				}
			};
			
			this.fs = new Filesystem(fsData);
			this.env = new Environment({
				vars: {
					PATH: "/bin"
				}
			}, this.fs);
		}
		
		Machine.prototype.createTerminal = function createTerminal(view) {
			return new Terminal(this, view);
		};
		
		return Machine;
	})();
});
