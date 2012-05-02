define(['require', 'exports', '../sha256'], function(require, exports, Crypto) {
	var PasswordAuthentication = exports.PasswordAuthentication = {
		password: function password(password) {
			return Crypto.SHA256(password).toString();
		},
		authenticate: function authenticate(password, compare) {
			if(!password) {
				console.warn('Make a password');
				return true;
			}
			
			return Crypto.SHA256(compare).toString() === password;
		}
	};
});
