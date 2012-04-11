define(['require', 'exports', './command', './events'], function(require, exports, command, events) {
	var CommandRunner = command.CommandRunner;
	var EventEmitter = events.EventEmitter;
	
	function clone(obj) {
		function F() {}
		F.prototype = obj;
		return new F();
	}
	
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
	
	exports.Environment = (function() {
		function Environment(globalEnviorment) {
			var self = this;
			
			this.globalEnvironment = globalEnvironment || { vars: {} };
			
			this.vars = clone(this.globalEnvironment.vars);
			
			EventEmitter.call(this);
		}
		
		inherits(Enviorment, EventEmitter);
		
		return Enviorment
	})();
});
