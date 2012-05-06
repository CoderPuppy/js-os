define(function(require, exports, module) {
	const methods = {};
	//var defaultMethod = undefined;
	
	// auto import password
	var PasswordAuthentication = require('./auth/password').PasswordAuthentication;
	var users = require('./users');
	var Session = require('./session').Session;
	
	Object.defineProperties(methods, {
		password: {
			value: PasswordAuthentication,
			writable: false,
			configurable: false,
			enumerable: true
		}
	});
	const defaultMethod = 'password';
	
	const never = Object.create({}, {
		authenticate: {
			value: function() { 
				console.error('Change your authentication method');
				return false;
			},
			enumerable: true
		},
		password: {
			value: function(o, p) { return p; },
			enumerable: true
		}
	});
	
	var auth = exports.auth = function auth(methodName) {
		var rtn = {};
		
		method = methods[methodName] || methods[defaultMethod] || never;
		
		Object.defineProperties(rtn, {
			authenticate: {
				enumerable: true,
				value: method.authenticate,
				writable: false
			},
			password: {
				enumerable: true,
				value: method.password,
				writable: false
			}
		});
		
		return rtn;
	};
	
	var register = exports.register = function register(name, method) {
		if(users.session instanceof Session && users.session.level === 'admin') { // check permissions
			if(typeof(methods[name]) === 'undefined' && typeof(method) !== 'undefined') {
				Object.defineProperty(methods, name, {
					value: method,
					writable: false,
					enumerable: true,
					configurable: false
				});
			}
		} else {
			throw new Error('You are not an admin');
		}
		
		return exports;
	};
});
