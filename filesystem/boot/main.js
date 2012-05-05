define(function(require, exports, module) {
	var api = require('API'), fs = require('FS');
	var users = require('./users');
	var globalEnv = require('./globalEnv');
	
	console.log(api, fs);
	
	exports.users = users;
});
