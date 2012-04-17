define(['require', 'exports'], function(require, exports) {
	var types = exports.types = {
		string: (function() {
			function string() {
				
			}
			
			string.prototype.parse = function parse(value) {
				return value;
			};
			
			return string;
		})(),
		number: (function() {
			function number() {
				
			}
			
			number.prototype.parse = function parse(value) {
				return parseFloat(value);
			};
			
			return number;
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
		function Argument(typeName) {
			this.type = new (findType(typeName));
		}
		
		Argument.prototype.setInput = function setInput(val) {
			this.value = val;
			
			this.parse();
			
			return this;
		};
		
		Argument.prototype.parse = function parse() {
			return this.type.parse(this.value);
		};
		
		return Argument;
	})();
});
