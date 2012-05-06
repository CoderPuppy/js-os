define(function(require, exports, module) {
//require(['./fs/index.js', './fs/bootloader.js'], function(filesystem, bootloader) {
	var BootLoader = require('../fs/bootloader').BootLoader;
	var Filesystem = require('../fs/index').Filesystem;
	var MachineView = require('./test').MachineView;
	
	var fs = exports.fs = new Filesystem({root: {files: {}, name: "FILESYSTEM_ROOT_/"}});
	var bootLoader = exports.bootLoader = new BootLoader(fs, {
	
	}, {
		baseUrl: 'filesystem'
	}, function(main) {
		window.machine = main;
		
		var view = new MachineView(main);
	
		document.body.appendChild(view.el);
	});
	
	window.fs = fs;
	window.bootLoader = bootLoader;
	window.machine = bootLoader.exports;
	window.MachineView = MachineView;
//});
});
