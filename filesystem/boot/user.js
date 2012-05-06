define(function(require, exports, module) {
	var EventEmitter = require('./events').EventEmitter; // Import EventEmitter
	var Session = require('./session').Session; // And also session
	var auth = require('./auth');
	
	var fs = require('FS');
	
	var inherits = function(ctor, superCtor) { // inherits: make one thing inherit from another
	  ctor.super_ = superCtor; // set it's super_ to what it inherits from
	  ctor.prototype = Object.create(superCtor.prototype, { // Set it's prototype to a object created with it's super's prototype without calling any constructors
		constructor: { // keep the constructor the same
		  value: ctor, // with a value of it
		  enumerable: false, // not enumerable
		  writable: true, // writable???
		  configurable: true // configurable???
		}
	  });
	};
	
	function initUserFolder(username) {
		var folder = fs.folder(username, {
			create: true,
			dir: fs.folder('/home')
		});
		
		fs.file('.rc', {
			create: true,
			type: fs.FILE,
			dir: folder
		}).contents = "echo This is from your ~/.rc";
		
		return folder;
	}
	
	var User = exports.User = (function UserClass() { // Users start here
		function User(name, options) { // more precisly right here: the machine this user was created on, it's username and how it should authenticate
			var self = this; // save this
			var __authMethod = options.authMethod || undefined,
				__admin = !!options.admin,
				__sessions = [],
				__password;
			
			this.name = name; // and it's name
			
			initUserFolder(name);
			
			EventEmitter.call(this); // let this emit events
			
			function getLevel(level) {
				if(( !__admin && level === User.ADMIN ) || !level) level = User.BASIC;
				
				return level;
			}
			
			function privlegedSelf(level) { // get a privleged version of it
				return __sessions[__sessions.push(new Session(self, level)) - 1]; // Return a session for this and that level
			}
			
			this.password = function password(old, newP) { // password: set the password: the old password and the new password
				if(typeof(newP) == 'undefined' && typeof(__password) == 'undefined') { // if we don't have a password and no new password was specified
					newP = old; // assume that the new password is in old
					old = undefined; // and that we don't need a old password
				}
				
				if(auth.auth(__authMethod).authenticate(__password, old, User.CHANGE_PASSWORD)) { // make sure we can change it
					__password = auth.auth(__authMethod).password(newP); // set it to the filtered result of the new password
				} else {
					console.warn('Unable to change password'); // say oh no we can't change the password
				}
				
				return this; // and make it chainable
			};
			
			this.authenticate = function authenticate(password, level) { // authenticate: authenticate the user using the `password` at level `options.level` and call cb
				level = getLevel(level);
				
				if(auth.auth(__authMethod).authenticate(__password, password, level)) { // check if the password was correct
					this.emit('authenticate', level, cb); // emit a general event
					this.emit('athuenticate:' + level, cb) // and a more specific one
					
					return privlegedSelf(level);
				} else {
					throw new Error('Could not authenticate: incorrect password');
				}
			};
		}
		
		inherits(User, EventEmitter); // this is an event emitter
		
		User.BASIC = 'basic'; // some constants for levels of authentication this one for basic: just logging in
		User.ADMIN = 'admin'; // and admin is: also be able to administer the system
		User.CHANGE_PASSWORD = 'UsEr_cHaNgE-PaSwOrD';
		
		return User;
	})();
});
