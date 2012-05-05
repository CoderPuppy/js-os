define(['require', 'exports', '../fs/index', '../fs/bootloader'], function(require, exports, filesystem, bootloader) {
//require(['./fs/index.js', './fs/bootloader.js'], function(filesystem, bootloader) {
	var BootLoader = bootloader.BootLoader;
	var Filesystem = filesystem.Filesystem;
	
	var fs = exports.fs = new Filesystem({root: {files: {}, name: "FILESYSTEM_ROOT_/"}});
	var bootLoader = exports.bootLoader = new BootLoader(fs, {
	
	}, {
		baseUrl: 'filesystem'
	}, function(main) {
		window.machine = main;
	});
	
	window.fs = fs;
	window.bootLoader = bootLoader;
	window.machine = bootLoader.exports;
//});
});
