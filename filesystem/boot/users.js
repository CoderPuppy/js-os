define(function(require, exports, module) {
	var fs = require('FS');
	var User = require('./user').User;
	
	fs.folder('/home', { create: true });
	
	var users = exports.users = {
		// default users
		
		root: new User('root', 'password')
	};
	
	var create = exports.create = function create(username, authType) {
		if(users[username] instanceof User) throw new Error('No duplicate users');
		
		return users[username] = new User(username, authType);
	};
	
	var remove = exports.remove = function remove(username) {
		delete users[username];
	};
	
	var login = exports.login = function login(username, password, options, cb) {
		if(!(users[username] instanceof User)) throw new Error('No such user: ' + username);
		
		return users[username].authenticate(password, options, cb);
	};
});
