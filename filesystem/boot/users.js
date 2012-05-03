define(function(require, exports, module) {
	var fs = require('FS');
	var User = require('./user').User;
	
	fs.folder('/home', { create: true });
	
	var create = exports.create = function create(username, authType) {
		if(users[username] instanceof User) throw new Error('No duplicate users');
		
		return users[username] = new User(username, authType);
	};
});
