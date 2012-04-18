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
			
			string.prototype.isValid = function isValid(value) {
				return true;
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
			
			number.prototype.isValid = function isValid() {
				return /^[\d\.]+$/.test(this.value);
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
			
			password.prototype.isValid = function isValid(value) {
				return true;
			};
			
			return password;
		})(),
		selection: (function() {
			function selection(data) {
				this.values = {};
				
				if(data.values.length && data.values.forEach) {
					[].forEach.call(data.values, function(v) {
						this.values[v] = v;
					}, this);
				} else if(typeof(data.values) == 'object') {
					this.values = data.values;
				}
			}
			
			selection.prototype.setInput = function setInput(value) {
				this.value = value;
				
				return this;
			};
			
			selection.prototype.parse = function parse() {
				return this.values[this.value];
			};
			
			selection.prototype.viewify = function viewify() {
				return this.value;
			};
			
			selection.prototype.autoComplete = function autoComplete(before) {
				return Object.keys(this.values).filter(function(v) {
					return v.substring(0, before.length) == before;
				});
			};
			
			selection.prototype.isValid = function isValid() {
				return this.values.indexOf(this.value) != -1;
			};
			
			return selection;
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
		
		Argument.prototype.autoComplete = function autoComplete(before) {
			return this.type.autoComplete(before);
		};
		
		Argument.prototype.isValid = function isValid() {
			return this.type.isValid();
		};
		
		return Argument;
	})();
});
