define(function(require, exports, module) {
	var Environment = require('./env').Environment;
	
	function loadEnv() { // Should load from filesystem
		try { // to load it from the filesystem
			console.log(JSON.parse(require('text!etc/environment.json')));
		} catch(e) {
			console.error(e, e.message, e.arguments, e.stack, require('text!etc/environment.json'));
		}
		
		return {
			vars: {
				PATH: '/bin'
			}
		};
	}
	
	module.exports = new Environment(loadEnv());
});
