define(function(require, exports, module) {
	var methods = exports.methods = {};
	var defaultMethod = exports.defaultMethod = undefined;
	
	// auto import password
	var PasswordAuthentication = require('./auth/password').PasswordAuthentication;
	
	methods.password = PasswordAuthentication;
	defaultMethod = 'password';
	
	var never = {
		authenticate: function() { 
			console.error('Change your authentication method');
			return false;
		},
		password: function(o, p) { return p; }
	};
	
	var auth = exports.auth = function auth(method) {
		return methods[method] || methods[defaultMethod] || never;
	};
});
