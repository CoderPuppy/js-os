define(['require', 'exports'], function(require, exports) {
	var types = exports.types = {
		string: (function() {
			function string() {
				
			}
			
			string.prototype.setInput = function setInput(value) {
				this.value = value;
				
				return this
			};
			
			string.prototype.parse = function parse() {
				return this.value;
			};
			
			string.prototype.viewify = function viewify() {
				return this.value;
			};
			
			string.prototype.autoComplete = function autoComplete() {
				return [];
			};
			
			return string;
		})(),
		number: (function() {
			var numberAutoComplete = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '.'];
			
			function number() {
				
			}
			
			number.prototype.setInput = function setInput(value) {
				this.value = parseFloat(value);
				
				return this;
			};
			
			number.prototype.parse = function parse() {
				return this.value;
			};
			
			number.prototype.viewify = function viewify() {
				return this.value;
			};
			
			number.prototype.autoComplete = function autoComplete(before) {
				return numberAutoComplete;
			};
			
			return number;
		})(),
		password: (function() {
			function password() {
				
			}
			
			password.prototype.setInput = function setInput(value) {
				this.value = value;
				
				return this;
			};
			
			password.prototype.parse = function parse() {
				return this.value;
			};
			
			password.prototype.viewify = function viewify() {
				return this.value.replace(/[\W\D]/g, '*');
			};
			
			password.prototype.autoComplete = function autoComplete(before) {
				return undefined;
			};
			
			return password;
		})()
	};
	var addType = exports.addType = function addType(name, Class) {
		types[name] = Class;
	};
	var removeType = exports.removeType = function removeType(name) {
		delete types[name];
	};
	var findType = exports.findType = function findType(name) {
		return types[name];
	};
	
	var Argument = exports.Argument = (function() {
		function Argument(typeName, typeData) {
			this.type = new (findType(typeName))(typeData || {});
		}
		
		Argument.prototype.setInput = function setInput(val) {
			this.value = val;
			
			this.type.setInput(val);
			
			return this;
		};
		
		Argument.prototype.parse = function parse() {
			return this.type.parse();
		};
		
		Argument.prototype.viewify = function viewify() {
			return this.type.viewify();
		};
		
		Argument.prototype.autoComplete = function autoComplete() {
			return this.type.autoComplete();
		};
		
		return Argument;
	})();
});
