define(function(require, exports, module) {
	var fs = require('FS');
	var User = require('./user').User;
	
	fs.folder('/home', { create: true });
	
	var user;
	var session;
	
	Object.defineProperties(exports, {
		user: {
			get: function() { return user; },
			enumerable: true
		},
		session: {
			get: function() { return session; },
			enumerable: true
		}
	});
	
	var users = exports.users = {
		// default users
		
		root: new User('root', {
			authMethod: 'password',
			admin: true
		})
	};
	
	var create = exports.create = function create(username, authType) {
		if(users[username] instanceof User) throw new Error('No duplicate users');
		
		return users[username] = new User(username, authType);
	};
	
	var remove = exports.remove = function remove(username) {
		delete users[username];
	};
	
	var login = exports.login = function login(username, password, level) {
		if(!(users[username] instanceof User)) throw new Error('No such user: ' + username);
		
		user = users[username];
		
		return session = users[username].authenticate(password, level);
	};
});
