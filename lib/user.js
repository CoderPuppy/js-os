define(['require', 'exports',  './events', './session'], function(require, exports, events, session) {
	var EventEmitter = events.EventEmitter;
	var Session = session.Session;
	
	var inherits = function(ctor, superCtor) {
	  ctor.super_ = superCtor;
	  ctor.prototype = Object.create(superCtor.prototype, {
		constructor: {
		  value: ctor,
		  enumerable: false,
		  writable: true,
		  configurable: true
		}
	  });
	};
	
	var User = exports.User = (function UserClass() {
		function User(machine, name, authMethod) {
			var self = this;
			var __password;
			
			this.machine = machine;
			this.name = name;
			
			this._authMethod = authMethod || 'always';
			
			EventEmitter.call(this);
			
			function privlegedSelf(level) {
				level = level || User.BASIC;
				
				//return 'Terminal at: ' + level + ' level for: ' + self.name;
				return new Session(self, level);
			}
			
			this.password = function password(old, newP) {
				if(typeof(newP) == 'undefined' && typeof(__password) == 'undefined') {
					newP = old;
					old = undefined;
				}
				
				if(this.machine.auth(this._authMethod).authenticate(__password, old)) {
					__password = this.machine.auth(this._authMethod).password(newP);
				} else {
					console.warn('Unable to change password');
				}
				
				return this;
			};
			
			this.authenticate = function authenticate(password, options, cb) {
				if(typeof(options) == 'function') {
					var t = cb;
					cb = options;
					options = t || {};
				}
				
				if(typeof(password) == 'function') {
					cb = password;
					options = options || {};
					password = undefined;
				}
				
				if(typeof(password) == 'object') {
					cb = options;
					options = password || {};
					password = undefined;
				}
				
				options = options || {};
				
				if(this.machine.auth(this._authMethod).authenticate(__password, password)) {
					this.emit('authenticate', options.level || User.BASIC, cb);
					this.emit('athuenticate:' + ( options.level || User.BASIC ), cb)
					
					cb(undefined, privlegedSelf(options.level));
				} else {
					cb(new Error('Could not authenticate: incorrect password'));
				}
			};
		}
		
		inherits(User, EventEmitter);
		
		User.BASIC = 'basic';
		User.ADMIN = 'admin';
		
		return User;
	})();
});
